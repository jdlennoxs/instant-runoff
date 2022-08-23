const createCsvWriter = require('csv-writer').createObjectCsvWriter;

const writeCsv = (filename, headers, scores) => {
    const csvWriter = createCsvWriter({
        path: `./results/${filename}`,
        header: headers.map(header => ({id: header, title: header}))
      });

      csvWriter
  .writeRecords(scores)
  .then(()=> console.log(`The CSV file ${filename} was written successfully`));
}

exports.writeCsv = writeCsv