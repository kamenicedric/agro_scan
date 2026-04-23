import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, StyleSheet, Animated, ActivityIndicator, Image } from 'react-native';
import { TopBar, Card, SectionTitle, Pill, PrimaryButton } from '../components/SharedComponents';
import { Colors, Spacing, Radius, Fonts } from '../theme';
import { useAuth } from '../context/AuthContext';
import { runFullDiagnostic } from '../services/apiService';

function AnimatedBar({ label, value, color, delay = 0 }: any) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => { Animated.timing(anim, { toValue: value, duration: 900, delay, useNativeDriver: false }).start(); }, [value]);
  const width = anim.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] });
  return (
    <View style={s.barWrap}>
      <View style={s.barLabelRow}><Text style={s.barLabel}>{label}</Text><Text style={[s.barValue,{color:Colors.primary}]}>{value}%</Text></View>
      <View style={s.barTrack}><Animated.View style={[s.barFill,{backgroundColor:color,width}]} /></View>
    </View>
  );
}

function StepRow({ label, done, active }: any) {
  const opacity = useRef(new Animated.Value(done ? 1 : 0.3)).current;
  useEffect(() => {
    if (active) { Animated.loop(Animated.sequence([Animated.timing(opacity,{toValue:1,duration:600,useNativeDriver:true}),Animated.timing(opacity,{toValue:0.3,duration:600,useNativeDriver:true})])).start(); }
    else { Animated.timing(opacity,{toValue:done?1:0.3,duration:300,useNativeDriver:true}).start(); }
  },[active,done]);
  return (
    <Animated.View style={[s.stepRow,{opacity}]}>
      <Text style={s.stepIcon}>{done?'✅':active?'⏳':'○'}</Text>
      <Text style={[s.stepLabel,done&&{color:Colors.primary}]}>{label}</Text>
    </Animated.View>
  );
}

const STEPS = ['Création du diagnostic','Upload photo','Analyse MobileNetV2','Recommandations N-P-K'];

export default function AnalysisScreen({ navigation, route }: any) {
  const { photo, location, historique } = route.params || {};
  const { user, profileId } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [result, setResult] = useState<any>(null);
  const [error, setError]   = useState<string|null>(null);
  const [method, setMethod] = useState('');

  useEffect(() => { runAnalysis(); }, []);

  async function runAnalysis() {
    setError(null); setResult(null); setCurrentStep(0);
    try {
      const data = await runFullDiagnostic({
        userId: profileId || user!.id, lat: location?.latitude??4.0511, lng: location?.longitude??9.7679,
        superficie: route.params?.superficie, historique: historique??[],
        photo: { uri: photo?.uri, width: photo?.width??0, height: photo?.height??0, blurScore: photo?.blurScore },
        onStep: (step) => setCurrentStep(step),
      });
      setCurrentStep(STEPS.length);
      setResult(data.result);
      setMethod(data.analysis_method || '');
      route.params.diagnostic_id = data.diagnostic_id;
    } catch(e:any) { setError(e.message||"Erreur analyse."); }
  }

  const isLoading = !result && !error;
  return (
    <View style={s.container}>
      <TopBar title="Analyse IA" icon="🧠"
        badge={isLoading?'En cours...':error?'Erreur':'Terminé ✓'}
        badgeColor={isLoading?Colors.amber:error?Colors.red:undefined}
        showBack={!!error} onBack={()=>navigation.goBack()} />
      <ScrollView style={s.scroll} contentContainerStyle={s.sc} showsVerticalScrollIndicator={false}>
        {photo?.uri && (<View style={s.thumbWrap}><Image source={{uri:photo.uri}} style={s.thumb}/><View style={s.thumbOverlay}><Text style={s.thumbLabel}>Échantillon analysé</Text></View></View>)}
        {isLoading && (
          <Card style={{marginBottom:Spacing.md}}>
            <View style={s.loadingHeader}><ActivityIndicator color={Colors.primary} size="small"/><Text style={s.loadingTitle}>Pipeline IA...</Text></View>
            {STEPS.map((st,i)=><StepRow key={st} label={st} done={i<currentStep} active={i===currentStep}/>)}
            <View style={{marginTop:8,backgroundColor:Colors.accentSoft,borderRadius:Radius.sm,padding:8}}><Text style={{fontSize:10,color:Colors.primary,textAlign:'center'}}>🧠 MobileNetV2 → 🌍 SoilGrids → 🎨 Couleur</Text></View>
          </Card>
        )}
        {error && (<Card style={s.errCard}><Text style={s.errText}>❌ {error}</Text><PrimaryButton label="Réessayer" onPress={runAnalysis} style={{marginTop:12}}/></Card>)}
        {result && (
          <>
            <View style={{flexDirection:'row',alignItems:'center',gap:8,marginBottom:Spacing.md}}>
              <Pill label={method==='mobilenet'?'🧠 MobileNetV2':method==='soilgrids'?'🌍 SoilGrids':'🎨 Couleur'} color={method==='mobilenet'?'green':method==='soilgrids'?'blue':'amber'}/>
              {result.confidence&&<Text style={{fontSize:11,color:Colors.textMuted}}>Confiance: {Math.round(result.confidence*100)}%</Text>}
            </View>
            <SectionTitle>Classification texture</SectionTitle>
            <Card style={{marginBottom:Spacing.md}}>
              <AnimatedBar label="Argile" value={result.texture?.argile} color="#795548" delay={0}/>
              <AnimatedBar label="Limon"  value={result.texture?.limon}  color="#a1887f" delay={200}/>
              <AnimatedBar label="Sable"  value={result.texture?.sable}  color="#d7ccc8" delay={400}/>
            </Card>
            <Card style={{marginBottom:Spacing.md}}>
              <View style={s.classifRow}>
                <View><Text style={s.classifName}>{result.texture?.classification}</Text><Text style={s.classifSub}>USDA</Text></View>
                <Pill label={result.texture?.fertilite} color="green"/>
              </View>
              <View style={s.phRow}>
                <Text style={s.phLabel}>pH</Text>
                <View style={s.phBadge}><Text style={s.phValue}>{result.texture?.ph}</Text></View>
                <Text style={{fontSize:11,color:Colors.accent}}>{result.texture?.ph>=6&&result.texture?.ph<=7?'✓ Optimal':'⚠ À corriger'}</Text>
              </View>
            </Card>
            <SectionTitle>Données croisées</SectionTitle>
            <Card style={{marginBottom:Spacing.md}}>
              <View style={{flexDirection:'row',flexWrap:'wrap',gap:6,marginBottom:8}}>
                <Pill label="✓ OpenMeteo" color="green"/><Pill label="✓ SoilGrids" color="blue"/>
              </View>
              <Text style={{fontSize:10,color:Colors.textMuted}}>{result.meteo?.pluvio_mm_an}mm/an · {result.meteo?.temp_moy_c}°C · {result.zoneClimatique}</Text>
            </Card>
            <PrimaryButton label="Voir les recommandations →" onPress={()=>navigation.navigate('Results',{...route.params,result})}/>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container:{flex:1,backgroundColor:Colors.bgPage}, scroll:{flex:1}, sc:{padding:Spacing.lg,paddingBottom:Spacing.xxl},
  thumbWrap:{borderRadius:Radius.md,overflow:'hidden',height:120,marginBottom:Spacing.md},
  thumb:{width:'100%',height:'100%',resizeMode:'cover'},
  thumbOverlay:{...StyleSheet.absoluteFillObject,backgroundColor:'rgba(0,0,0,0.3)',justifyContent:'flex-end',padding:10},
  thumbLabel:{color:Colors.white,fontSize:11,fontWeight:Fonts.medium},
  loadingHeader:{flexDirection:'row',alignItems:'center',gap:10,marginBottom:Spacing.md},
  loadingTitle:{fontSize:13,fontWeight:Fonts.medium,color:Colors.primary},
  stepRow:{flexDirection:'row',alignItems:'center',gap:8,marginBottom:8},
  stepIcon:{fontSize:14,width:22}, stepLabel:{fontSize:12,color:Colors.textSecondary},
  errCard:{backgroundColor:Colors.redBg,borderColor:Colors.red}, errText:{fontSize:13,color:Colors.red},
  barWrap:{marginBottom:Spacing.sm}, barLabelRow:{flexDirection:'row',justifyContent:'space-between',marginBottom:4},
  barLabel:{fontSize:11,color:Colors.textSecondary}, barValue:{fontSize:11,fontWeight:Fonts.medium},
  barTrack:{height:8,backgroundColor:'#e0e0e0',borderRadius:4,overflow:'hidden'}, barFill:{height:'100%',borderRadius:4},
  classifRow:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',marginBottom:10},
  classifName:{fontSize:15,fontWeight:Fonts.semibold,color:Colors.primary}, classifSub:{fontSize:10,color:Colors.textMuted},
  phRow:{flexDirection:'row',alignItems:'center',gap:8,borderTopWidth:0.5,borderTopColor:Colors.borderMuted,paddingTop:10},
  phLabel:{fontSize:11,color:Colors.textMuted,flex:1},
  phBadge:{backgroundColor:Colors.primary,paddingHorizontal:10,paddingVertical:3,borderRadius:Radius.full},
  phValue:{color:Colors.white,fontSize:12,fontWeight:Fonts.semibold},
});
