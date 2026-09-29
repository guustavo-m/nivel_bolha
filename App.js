import { StatusBar } from 'expo-status-bar';
import { StyleSheet, ScrollView, Text, View } from 'react-native';
import { useEffect, useState } from 'react';
import { Accelerometer } from 'expo-sensors'

export default function App() {

  const [dados, setDados] = useState(null)
  const [erro, setErro] = useState('')

  useEffect(() => {
    let assinatura;
    let ativo = true;

    async function iniciarSensor() {
      try {
        const disponivel = await Accelerometer.isAvailableAsync()
        if(!ativo) return;
        if(!disponivel) {
          setErro("Sensor indisponível. Abra um celular fictício.")
          return;
        }

        Accelerometer.setUpdateInterval(100)
        assinatura = Accelerometer.addListener((leitura) => {
          if (ativo) setDados(leitura)
        })
      } catch {
        if (ativo) setErro("Não foi possível acessar o sensor. Reabra o app.")
      }
    }

    iniciarSensor()

    return() => {
      ativo = false;
      assinatura?.remove()
    }
    
  }, [])

  const x = dados?.x ?? 0
  const y = dados?.y ?? 0
  const nivelado = dados !== null && Math.abs(x) < 0.04 && Math.abs(y) < 0.04
  const cor = nivelado ? "#22c55e" : "#facc15"

  const deslocamentoX = -x * 180
  const deslocamentoY = y * 180
  const distancia = Math.hypot(deslocamentoX, deslocamentoY)
  const limite = Math.max(1, distancia / 90)

  return (
    <ScrollView contentContainerStyle={styles.tela}>
      <StatusBar style="light"/>
      <Text style={styles.titulo}>Nível da Bolha</Text>
      <Text style={styles.instrucao}>
        Apoie o celular com a tela para cima.{'\n'}
        Incline devagar e observe a bolha.
      </Text>

      <View style={styles.nivel}>
        <View style={styles.linhaHorizontal} />
        <View style={styles.linhaVertical} />
        <View style={styles.alvo} />
        {dados && !erro && (
          <View style={[styles.bolha, {
            backgroundColor: cor,
            transform: [
              { translateX: deslocamentoX / limite },
              { translateY: deslocamentoY / limite },
            ],
          }]}/>
        )}
      </View>

      <Text style={[styles.status, { color: erro ? "#fca5a5" : cor}]}>
        {erro || (!dados ? "Aguardando sensor..." : nivelado ? "Nivelado !" : "Inclinado")}
      </Text>
      <Text style={styles.leitura}>
        X: {dados ? x.toFixed(2) : '--'} g   |   Y: {dados ? y.toFixed(2) : '--'} g
      </Text>
      <Text style={styles.rodape}>Bolha verde no centro = celular nivelado</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  tela: {
    flexGrow: 1,
    backgroundColor: "#0f172a",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 50,
  },

  titulo: {
    color: "#ffffff",
    fontSize: 32,
    fontWeight: "800",
    textAlign: "center",
    letterSpacing: 0.5,
  },

  instrucao: {
    color: "#cbd5e1",
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
    marginTop: 12,
    marginBottom: 30,
  },

  nivel: {
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: "#1e293b",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 4,
    borderColor: "#334155",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 10,
    overflow: "hidden",
  },

  linhaHorizontal: {
    position: "absolute",
    width: 216,
    height: 1,
    backgroundColor: "#64748b",
    opacity: 0.7,
  },

  linhaVertical: {
    position: "absolute",
    width: 1,
    height: 216,
    backgroundColor: "#64748b",
    opacity: 0.7,
  },

  alvo: {
    position: "absolute",
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: "#94a3b8",
    backgroundColor: "transparent",
    opacity: 0.8,
  },

  bolha: {
    position: "absolute",
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: "#ffffff",
    shadowColor: "#ffffff",
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 8,
  },

  status: {
    fontSize: 25,
    fontWeight: "800",
    marginTop: 20,
    textAlign: "center",
    fontVariant: ["tabular-nums"],
  },

  leitura: {
    color: "#e2e8f0",
    fontSize: 16,
    fontWeight: "600",
    marginTop: 12,
    textAlign: "center",
    backgroundColor: "#1e293b",
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
    overflow: "hidden",
  },

  rodape: {
    color: "#94a3b8",
    fontSize: 14,
    textAlign: "center",
    marginTop: 24,
    lineHeight: 20,
  },
});