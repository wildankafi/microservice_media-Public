const express = require('express');
const router = express.Router();
const isBase64 = require('is-base64');
const base64Img = require('base64-img');
const fs = require('fs');
const {
  Media
} = require('../models');

router.get('/', async (req, res) => {
  const sqlOptions = {
    attributes: ['id', 'image']
  }
  const media = await Media.findAll(sqlOptions);
  const mappedMedia = media.map((m) =>{
    m.image = `${req.get('host')}/${m.image}`;
    return m;
  })
  return res.json({
    status: 'Success',
    data: mappedMedia
  });
});

router.post('/', (req, res) => {
  const image = req.body.image;
  if (!isBase64(image, {
      mimeRequired: true
    })) {
    return res.status(400).json({
      status: 'error',
      message: 'invalid base64'
    });
  }
  // return res.send('OK');
  base64Img.img(image, './public/images', Date.now(), async (err, filepath) => {
    if (err) {
      return res.status(400).json({
        status: 'error',
        message: err.message
      })
    }

    // public/images/2312121.png
    const filename = filepath.split('/').pop();
    // simpan ke media
    const media = await Media.create({
      image: `images/${filename}`
    });

    return res.json({
      status: 'Success',
      data: {
        id: media.id,
        image: `${req.get('host')}/images/${filename}`
      }
    })
  })
})


router.delete('/:id', async (req, res) => {
  const id =  req.params.id;

  const media = await Media.findByPk(id)
  if (!media) {
    return res.status(404).json({status:'error', message:'Media Not found'});
  }
  fs.unlink(`./public/${media.image}`, async (err) => {
    if(err){
      return res.status(400).json({status:'error',message:err.message});
    }
    await Media.destroy({
      where: {
        id:id
      }
    });

    return res.json({
      status: 'Success',
      message: 'Image Berhasil Terhapus'
    });
  })
})
/* GET users listing. */
// router.get('/', function(req, res, next) {
//   res.send('respond with a resource');
// });

module.exports = router;
