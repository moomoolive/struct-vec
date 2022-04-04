import FileHound from 'filehound'
import fs from 'fs'
import {dirname} from 'path'
import {fileURLToPath} from 'url'

const targetFolder = process.argv[2].trim()
const extension = process.argv[3]?.trim() === "--ts" ? "ts" : "js"

console.info("transforming imports for", targetFolder, "to extension", extension)

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const files = FileHound.create()
  .paths(__dirname + targetFolder)
  .discard('node_modules')
  .ext(extension)
  .find()


files.then((filePaths) => {

  filePaths.forEach((filepath) => {
    fs.readFile(filepath, 'utf8', (err, data) => {


      if (!data.match(/import .* from/g)) {
        return
      }
      let newData = data
        .replace(/(import .* from\s+['"])(.*)(?=['"])/g, `$1$2.${extension}`)
        .replace(/(export .* from\s+['"])(.*)(?=['"])/g, `$1$2.${extension}`)
      
      if (err) throw err

      console.log(`writing to ${filepath}`)
      fs.writeFile(filepath, newData, function (err) {
        if (err) {
          throw err
        }
        console.log('complete')
      })
    })

  })
})
