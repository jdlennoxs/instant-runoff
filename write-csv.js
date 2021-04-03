const createCsvWriter = require('csv-writer').createObjectCsvWriter;

const writeCsv = (headers, scores) => {
    const csvWriter = createCsvWriter({
        path: './results/out.csv',
        header: headers.map(header => ({id: header, title: header}))
      });

      csvWriter
  .writeRecords(scores)
  .then(()=> console.log('The CSV file was written successfully'));
}

exports.writeCsv = writeCsv