/*
input: path to target directory (defaults to current directory)
output: first digits distribution of file sizes in the given directory
steps:
    go over all files (recursively), for each file:
        read file size (in bytes)
        calc file size's first digit
        increase file counter
    after all files are processes:
        calculate first digits distribution
*/

const fs = require('fs');

function getFilesData(path = './') {
    const files = [];
    const firstDigitsMap = {};
    for (let i=0; i<10; i++)  {
        firstDigitsMap[i] = {count: 0};
    }
    let filesCounter = 0;
    
    // console.log('Current path:', path);
    
    let entries;
    try {
        entries = fs.readdirSync(path, { withFileTypes: true });
    } catch (err) {
      console.log(err.message);
      return;
    }

    // console.log('entries:', entries);

    entries.forEach((entry) => {
        const name = `${path}/${entry.name}/`;

        if (entry.isDirectory()) {
            const data = getFilesData(name);
            filesCounter += data.filesCounter;
            // files.push(...data.files);
            Object.keys(firstDigitsMap).forEach((key) => {
                firstDigitsMap[key].count += data.firstDigitsMap[key].count;
            });
        } else {
            // console.log('Current file:', entry.name);
            let stats;
            try {
                stats = fs.statSync(name);
            } catch (err) {
              console.log(err.message);
              return;
            }
            const fileSizeInBytes = stats['size'];
            const firstDigit = (fileSizeInBytes + '')[0];
            // files.push({path: name, size: fileSizeInBytes});
            firstDigitsMap[firstDigit].count++;
            filesCounter++;
        }
    });

    return {filesCounter, files, firstDigitsMap};
}

function theorem(digit) {
    const distribution = Math.log10(1+(1/digit));
    return distribution * 100;
}

function run(path) {
    const {filesCounter, files, firstDigitsMap: map} = getFilesData(path);

    // calculate the distribution
    Object.keys(map).forEach((key) => {
        map[key].distribution = map[key].count / filesCounter * 100;
        map[key].theorem = theorem(key);
        map[key].difference = map[key].distribution - map[key].theorem;
    });

    console.log('\nFiles count:', filesCounter);

    // console.log('\nFiles:');
    // files.forEach((file) => {
    //     console.log(file.path);
    // });

    console.log('\nFirst digit distribution:');
    const stats = Object.keys(map).slice(1).map((key) => {
        return {
            digit: Number( key ),
            val: Number( map[key].distribution.toFixed(2) ),
            theorem: Number( map[key].theorem.toFixed(2) ),
            diff: Number( map[key].difference.toFixed(2) )
        };
    });
    console.table(stats);
}


const args = process.argv.slice(2);
const path = args[0];

run(path);
