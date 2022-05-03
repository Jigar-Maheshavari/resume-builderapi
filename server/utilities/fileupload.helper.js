const fs = require('fs')

const AWS = require('aws-sdk')

const config = require('config')

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
})

// const uploadLocalFile = (file, filePath) => {
//   return new Promise((resolve, reject) => {
//     let filename = file.hapi.filename
//     const fileType = file.hapi.filename.replace(/^.*\./, '')
//     const uniqueNum = new Date().getMilliseconds()
//     filename = uniqueNum + '_' + filename.replace(' ', '_')

//     const data = file._data
//     let imagePath = 'uploads/'
//     let path = './uploads'

//     if (!fs.existsSync(path)) {
//       fs.mkdirSync(path, { recursive: true })
//     }

//     if (!fs.existsSync(path)) {
//       fs.mkdirSync(path, { recursive: true })
//     }

//     if (filePath) {
//       path = `${path}/${filePath}`
//       imagePath = `${imagePath}${filePath}/`
//     }

//     if (!fs.existsSync(path)) {
//       fs.mkdirSync(path, { recursive: true })
//     }

//     fs.writeFile(`${path}/` + filename, data, err => {
//       if (err) {
//         reject(err)
//       }
//       resolve({
//         message: 'Uploaded successfully!',
//         success: true,
//         filePath: `${imagePath}${filename}`,
//         fileName: filename,
//         fileType: fileType
//       })
//     })
//   })
// }

const uploadLocalFileTest = (file, filePath, name) => {
  return new Promise((resolve, reject) => {
    const imagePath = 'uploads/'
    const path = './uploads'

    if (!fs.existsSync(path)) {
      fs.mkdirSync(path, { recursive: true })
    }

    if (!fs.existsSync(filePath)) {
      fs.mkdirSync(filePath, { recursive: true })
    }

    fs.writeFile(`${imagePath}/${filePath}/${name}`, file, err => {
      if (err) {
        reject(err)
      }
      resolve({
        message: 'Uploaded successfully!',
        success: true,
        filePath: `${imagePath}/${filePath}/${name}`,
        fileName: name
      })
    })
  })
}

const writeFileLocalDirectory = (processId, filesData) => {
  return new Promise(resolve => {
    const mainImagePath = 'temp/'
    const mainPath = './temp'
    const videoMainPath = `${mainPath}/${processId}/video`
    const videoPath = `${mainImagePath}${processId}/video`
    const imagesMainPath = `${mainPath}/${processId}/images`
    const imagesPath = `${mainImagePath}${processId}/images`

    if (!fs.existsSync(mainPath)) {
      fs.mkdirSync(mainPath, { recursive: true })
    }
    if (!fs.existsSync(videoMainPath)) {
      fs.mkdirSync(videoMainPath, { recursive: true })
    }
    if (!fs.existsSync(imagesMainPath)) {
      fs.mkdirSync(imagesMainPath, { recursive: true })
    }
    const writeVideoPath = `${videoPath}/${filesData.name}`
    fs.writeFile(writeVideoPath, filesData.data, err => {
      if (err) {
        resolve({
          error: err,
          success: false
        })
      }
      resolve({
        message: 'Uploaded successfully!',
        success: true,
        filePath: `${writeVideoPath}`,
        videoFolder: `${videoPath}`,
        imageFolder: `${imagesPath}`,
        fileName: filesData.name
      })
    })
  })
}

const handleFileUpload = (file, filePath = null) => {
  // return uploadLocalFile(file, filePath)
  return uploadFileToBucket(file, filePath)
}

const uploadFileToBucket = (file, filePath) => {
  return new Promise((resolve, reject) => {
    const data = file._data
    let filename = file.hapi.filename
    const fileType = filename.replace(/^.*\./, '')
    const uniqueNum = new Date().getMilliseconds()
    filename = uniqueNum + '_' + filename.replace(' ', '_')
    if (!filePath) {
      filePath = 'profile'
    }
    const params = {
      Bucket: 'ethicalcode-assets', // pass your bucket name
      Key: `${filePath}/${filename}`, // file will be saved as testBucket/contacts.csv
      Body: data
    }
    s3.upload(params, (s3Err, data) => {
      if (s3Err) {
        throw s3Err
      }
      console.log(`File uploaded successfully at ${data.Location}`)
      resolve({
        message: 'Uploaded successfully!',
        success: true,
        filePath: `${filePath}/${filename}`,
        fileName: filename,
        fileType: fileType
      })
    })
  })
}
const uploadDatasetFileToBucket = (file, filePath, name) => {
  return new Promise((resolve, reject) => {
    const data = file._data
    let filename = name
    const fileType = filename.replace(/^.*\./, '')
    const uniqueNum = new Date().getMilliseconds()
    const val = filename.trim()
    const replaced = val
      .split(' ')
      .join('_')
      .split('(')
      .join('_')
      .split(')')
      .join('_')
    filename = uniqueNum + '_' + replaced
    const params = {
      Bucket: 'ec-server-stress', // pass your bucket name
      Key: `${filePath}/${filename}`, // file will be saved as testBucket/contacts.csv
      Body: data
    }
    s3.upload(params, (s3Err, data) => {
      if (s3Err) {
        throw s3Err
      }
      console.log(`File uploaded successfully at ${data.Location}`)
      resolve({
        message: 'Uploaded successfully!',
        success: true,
        filePath: `${filePath}/${filename}`,
        fileName: filename,
        fileType: fileType
      })
    })
  })
}

const deleteFile = filePath => {
  return new Promise((resolve, reject) => {
    var params = {
      Bucket: 'ethicalcode-assets', // pass your bucket name
      Key: `${filePath}` // file will be saved as testBucket/contacts.csv
    }
    s3.deleteObject(params, (err, data) => {
      if (data) {
        console.log('Deleted!... ' + filePath + '=>' + data)
        resolve({
          message: 'Deleted successfully!',
          status: true
        })
      } else {
        resolve({
          message: 'Check if you have sufficient permissions!',
          status: false
        })
        console.log('Check if you have sufficient permissions : ' + err)
      }
    })
  })
}

const uploadDataSet = (file, filePath) => {
  return new Promise((resolve, reject) => {
    const data = file
    const params = {
      Bucket: 'ec-server-stress', // pass your bucket name
      Key: `${filePath}`, // file will be saved as testBucket/contacts.csv
      Body: data
    }
    console.log('${filePath}: ', `${filePath}`)
    s3.upload(params, (s3Err, data) => {
      if (s3Err) {
        throw s3Err
      }
      console.log(`File uploaded successfully at ${data.Location}`)
      resolve({
        message: 'Uploaded successfully!',
        success: true,
        filePath: `${filePath}`
      })
    })
  })
}

const deleteDatasetFile = filePath => {
  return new Promise((resolve, reject) => {
    var params = {
      Bucket: 'ec-server-stress', // pass your bucket name
      Key: `${filePath}` // file will be saved as testBucket/contacts.csv
    }
    s3.deleteObject(params, (err, data) => {
      if (data) {
        console.log('Deleted!... ' + filePath + '=>' + data)
        resolve({
          message: 'Deleted successfully!',
          status: true
        })
      } else {
        resolve({
          message: 'Check if you have sufficient permissions!',
          status: false
        })
        console.log('Check if you have sufficient permissions : ' + err)
      }
    })
  })
}

const deleteFileModels = filePath => {
  return new Promise((resolve, reject) => {
    var params = {
      Bucket: 'ec-models-contents', // pass your bucket name
      Key: `${filePath}` // file will be saved as testBucket/contacts.csv
    }
    s3.deleteObject(params, (err, data) => {
      if (data) {
        console.log('Deleted!... ' + filePath + '=>' + data)
        resolve({
          message: 'Deleted successfully!',
          status: true
        })
      } else {
        resolve({
          message: 'Check if you have sufficient permissions!',
          status: false
        })
        console.log('Check if you have sufficient permissions : ' + err)
      }
    })
  })
}

// const deleteFileOld = async file => {
//   return new Promise((resolve, reject) => {
//     fs.stat('./' + file, (err, exists) => {
//       if (exists) {
//         fs.unlinkSync('./' + file)
//         resolve({
//           message: 'Deleted successfully!'
//         })
//       } else {
//         if (err) {
//           reject(err)
//         }
//       }
//     })
//   })
// }

const uploadNewsFileToBucket = (file, filePath, filename) => {
  return new Promise((resolve, reject) => {
    const params = {
      Bucket: 'ethicalcode-assets', // pass your bucket name
      Key: `${filePath}/${filename}`, // file will be saved as testBucket/contacts.csv
      Body: file
    }
    s3.upload(params, (s3Err, data) => {
      console.log('data: ', data)
      if (s3Err) {
        throw s3Err
      }
      resolve({
        message: 'Uploaded successfully!',
        success: true,
        filePath: `${filePath}/${filename}`,
        fileName: filename
      })
    })
  })
}

const uploadModelsFileToBucket = (file, filePath, filename) => {
  return new Promise((resolve, reject) => {
    const params = {
      Bucket: 'ec-models-contents', // pass your bucket name
      Key: `${config.modelS3Prefix}/${filePath}/${filename}`, // file will be saved as testBucket/contacts.csv
      Body: file
    }
    s3.upload(params, (s3Err, data) => {
      console.log('data: ', data)
      if (s3Err) {
        throw s3Err
      }
      resolve({
        message: 'Uploaded successfully!',
        success: true,
        path: data.key,
        filePath: `${filePath}/${filename}`,
        fileName: filename
      })
    })
  })
}

const getFileObject = async _keys => {
  return await Promise.all(
    _keys.map(
      _key =>
        new Promise((resolve, reject) => {
          s3.getObject({ Bucket: 'ethicalcode-assets', Key: _key }, function(
            err,
            _data
          ) {
            if (err) {
              resolve({ success: false })
            }
            resolve({
              success: true,
              data: _data.Body,
              name: `${_key.split('/').pop()}`
            })
          })
        })
    )
  ).catch(_err => {
    throw new Error(_err)
  })
}

const getFileObjectModelContents = async _keys => {
  return await Promise.all(
    _keys.map(
      _key =>
        new Promise((resolve, reject) => {
          s3.getObject({ Bucket: 'ec-models-contents', Key: _key }, function(
            err,
            _data
          ) {
            if (err) {
              resolve({ success: false })
            }
            resolve({
              success: true,
              data: _data.Body,
              name: `${_key.split('/').pop()}`
            })
          })
        })
    )
  ).catch(_err => {
    throw new Error(_err)
  })
}

const getObjectWithStreamModelFile = async _key => {
  return new Promise(resolve => {
    const params = {
      Bucket: 'ec-models-contents',
      Key: _key
    }
    const readStream = s3.getObject(params).createReadStream()
    resolve({
      data: readStream,
      name: `${_key.split('/').pop()}`
    })
  })
}

const downloadDatasetCsv = async _key => {
  return new Promise(resolve => {
    const params = {
      Bucket: 'ec-server-stress',
      Key: _key
    }
    const readStream = s3.getObject(params).createReadStream()
    resolve({
      data: readStream,
      name: `${_key.split('/').pop()}`
    })
  })
}

const downloadDatasetCsvMultiple = async _keys => {
  return await Promise.all(
    _keys.map(
      _key =>
        new Promise((resolve, reject) => {
          const params = {
            Bucket: 'ec-server-stress',
            Key: _key
          }
          const readStream = s3.getObject(params).createReadStream()
          resolve({
            data: readStream,
            name: `${_key.split('/').pop()}`
          })
        })
    )
  ).catch(_err => {
    throw new Error(_err)
  })
}

const uploadZipFile = _key => {
  const stream = require('stream')
  const _pass = new stream.PassThrough()
  s3.upload(
    {
      Bucket: 'ethicalcode-assets',
      Key: _key,
      Body: _pass
    },
    (err, data) => {
      console.log('err: ', err)
      console.log('data: ', data)
    }
  )
  return _pass
}

const getFileObjectModels = async _key => {
  return new Promise(resolve => {
    s3.getObject({ Bucket: 'ec-models-contents', Key: _key }, (err, _data) => {
      if (err) {
        resolve({ success: false, message: err.message ? err.message : err })
      }
      resolve({
        success: true,
        data: _data ? _data.Body : null,
        filePath: _key,
        fileName: _key.split('/').pop()
      })
    })
  })
}

const removeDir = path => {
  fs.rmdirSync(path, { recursive: true })
}

module.exports = {
  handleFileUpload,
  deleteFile,
  deleteFileModels,
  uploadNewsFileToBucket,
  getFileObject,
  uploadZipFile,
  uploadLocalFileTest,
  writeFileLocalDirectory,
  uploadModelsFileToBucket,
  uploadDatasetFileToBucket,
  getFileObjectModelContents,
  getObjectWithStreamModelFile,
  getFileObjectModels,
  removeDir,
  deleteDatasetFile,
  uploadDataSet,
  downloadDatasetCsv,
  downloadDatasetCsvMultiple
}
