import {
  Document,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";

type PlanoAulaPdfProps = {
  cabecalho: string;
  subtitulo: string;
  tema: string;
  serie: string;
  disciplina?: string | null;
  professor: string;
  conteudo: string;
  dataEmissao: string;
};

const styles = StyleSheet.create({
  page: {
    paddingTop: 40,
    paddingBottom: 50,
    paddingHorizontal: 48,
    fontSize: 11,
    fontFamily: "Helvetica",
    lineHeight: 1.5,
    color: "#1e293b",
  },
  headerBar: {
    borderBottomWidth: 2,
    borderBottomColor: "#1d4ed8",
    paddingBottom: 12,
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    color: "#1d4ed8",
    textTransform: "uppercase",
  },
  headerSubtitle: {
    fontSize: 10,
    color: "#475569",
    marginTop: 4,
  },
  docTitle: {
    fontSize: 16,
    fontFamily: "Helvetica-Bold",
    marginBottom: 12,
    textAlign: "center",
  },
  metaBox: {
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 4,
    padding: 12,
    marginBottom: 18,
  },
  metaRow: {
    marginBottom: 4,
  },
  metaLabel: {
    fontFamily: "Helvetica-Bold",
  },
  sectionTitle: {
    fontFamily: "Helvetica-Bold",
    fontSize: 12,
    marginTop: 10,
    marginBottom: 4,
    color: "#1e3a8a",
  },
  paragraph: {
    marginBottom: 6,
    textAlign: "justify",
  },
  footer: {
    position: "absolute",
    bottom: 24,
    left: 48,
    right: 48,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    paddingTop: 8,
    fontSize: 9,
    color: "#64748b",
    textAlign: "center",
  },
});

function renderConteudo(conteudo: string) {
  const blocks = conteudo.split("\n");
  return blocks.map((block, index) => {
    const trimmed = block.trim();
    if (!trimmed) return null;

    const isSection =
      /^\d+\.\s/.test(trimmed) ||
      trimmed === trimmed.toUpperCase() && trimmed.length < 80;

    if (isSection) {
      return (
        <Text key={index} style={styles.sectionTitle}>
          {trimmed}
        </Text>
      );
    }

    return (
      <Text key={index} style={styles.paragraph}>
        {trimmed}
      </Text>
    );
  });
}

export function PlanoAulaPdfDocument({
  cabecalho,
  subtitulo,
  tema,
  serie,
  disciplina,
  professor,
  conteudo,
  dataEmissao,
}: PlanoAulaPdfProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.headerBar}>
          <Text style={styles.headerTitle}>{cabecalho}</Text>
          <Text style={styles.headerSubtitle}>{subtitulo}</Text>
        </View>

        <Text style={styles.docTitle}>Plano de Aula</Text>

        <View style={styles.metaBox}>
          <Text style={styles.metaRow}>
            <Text style={styles.metaLabel}>Tema: </Text>
            {tema}
          </Text>
          <Text style={styles.metaRow}>
            <Text style={styles.metaLabel}>Ano/Série: </Text>
            {serie}
          </Text>
          {disciplina ? (
            <Text style={styles.metaRow}>
              <Text style={styles.metaLabel}>Disciplina: </Text>
              {disciplina}
            </Text>
          ) : null}
          <Text style={styles.metaRow}>
            <Text style={styles.metaLabel}>Professor(a): </Text>
            {professor}
          </Text>
          <Text style={styles.metaRow}>
            <Text style={styles.metaLabel}>Data: </Text>
            {dataEmissao}
          </Text>
        </View>

        <View>{renderConteudo(conteudo)}</View>

        <Text style={styles.footer} fixed>
          Documento gerado pela Plataforma Educação — {dataEmissao}
        </Text>
      </Page>
    </Document>
  );
}
