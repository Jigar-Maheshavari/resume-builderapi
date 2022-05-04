const fs = require('fs')

const config = require('config')

const uploadLocalFile = (file, filePath, fileName) => {
  return new Promise((resolve, reject) => {
    const filename = fileName

    const data = file
    let imagePath = 'uploads/'
    let path = './uploads'

    if (!fs.existsSync(path)) {
      fs.mkdirSync(path, { recursive: true })
    }

    if (!fs.existsSync(path)) {
      fs.mkdirSync(path, { recursive: true })
    }

    if (filePath) {
      path = `${path}/${filePath}`
      imagePath = `${imagePath}${filePath}/`
    }

    if (!fs.existsSync(path)) {
      fs.mkdirSync(path, { recursive: true })
    }

    fs.writeFile(`${path}/` + filename, data, err => {
      if (err) {
        reject(err)
      }
      resolve({
        message: 'Uploaded successfully!',
        success: true,
        filePath: `${imagePath}${filename}`,
        fileName: filename,
        fileType: 'pdf'
      })
    })
  })
}

module.exports = {
  uploadLocalFile
}
