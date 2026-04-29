import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { Key } from 'react';

// Create styles
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 30,
    fontFamily: 'Helvetica',
    fontSize: 10,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  pageNumber: {
    fontSize: 10,
    color: '#000000',
  },
  filterInfo: {
    fontSize: 10,
    marginBottom: 15,
  },
  table: {
    display: "flex",
    width: "auto",
    marginBottom: 20,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomColor: '#000000',
    borderBottomWidth: 0.5,
    minHeight: 20,
    alignItems: 'center',
  },
  tableHeaderRow: {
    flexDirection: "row",
    borderBottomColor: '#000000',
    borderBottomWidth: 1,
    paddingBottom: 2,
    marginBottom: 2,
  },
  tableCol: {
    paddingLeft: 4,
    paddingRight: 4,
  },
  tableCellHeader: {
    fontWeight: 'bold',
    fontSize: 10,
  },
  tableCell: {
    fontSize: 10,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    borderTopWidth: 1,
    borderTopColor: '#000000',
    paddingTop: 5,
  },
});

export interface PdfDocumentProps<Type> {
    objects: Type[];
    objectKey: (arg0: Type) => Key;
    columns: {label: string, flexWidth: string, output: (arg0: Type, arg1: number) => any}[];
    name: string;
    options?: {searchQuery?: string, total?: number};
}

export function PdfDocument<Type>({ objects, objectKey, columns, name, options }: PdfDocumentProps<Type>) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header Section */} 
        <View fixed>
            <View style={styles.headerContainer}>
                <Text style={styles.title}>{name}</Text>
                <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => (
                    `Page ${pageNumber} of ${totalPages}`
                )} />
            </View>
            <Text style={styles.filterInfo}>
                Filtered by: {options?.searchQuery || "None"}
            </Text>
        </View>

        {/* Table Header */}
        <View style={styles.tableHeaderRow} fixed>
            {/* {columns.map((col) => (
                <View key={col.key} style={{ ...styles.tableCol, width: getColWidth(col.key) }}>
                    <Text style={[styles.tableCellHeader, col.key === 'rowNumber' ? { textAlign: 'right', paddingRight: 8 } : {}]}>
                        {col.label}
                    </Text>
                </View>
            ))} */}
            {columns.map((col) => (
                <View key={col.label} style={{...styles.tableCol, flex: col.flexWidth}}>
                    <Text style={styles.tableCellHeader}>
                        {col.label}
                    </Text>
                </View>
            ))}
        </View>


        {/* Table Rows */}
        <View style={styles.table}>
          {objects.map((object, index) => (
            <View key={objectKey(object)} style={styles.tableRow}>
              {columns.map((col) => (
                <View key={`${objectKey(object)}-${col.label}`} style={{ ...styles.tableCol, flex: col.flexWidth }}>
                  <Text style={styles.tableCell}>
                    {col.output(object, index)}
                  </Text>
                </View>
              ))}
            </View>
          ))}
        </View>

        {/* Footer Section */}
        <View style={styles.footer} fixed>
            <Text>
                {objects.length} of {options?.total || objects.length} Roles
            </Text>
        </View>
      </Page>
    </Document>
  );
};
