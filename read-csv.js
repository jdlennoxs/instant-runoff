const csv = require('csv-parser')
const fs = require('fs')

const getResultsData = (filename) => {
    return new Promise((resolve, reject) => {
    const results = []
    let headers

    fs.createReadStream(`./test/${filename}`)
    .pipe(csv())
    .on('headers', headerNames => {
        headers = headerNames
    })
    .on('data', data => results.push(data))
    .on('end', () => {
    resolve({headers, results})
        console.log('Read csv.')
    })
})
}

exports.getResultsData = getResultsData