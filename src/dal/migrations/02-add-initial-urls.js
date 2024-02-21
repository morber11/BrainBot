const CustomUrl = require('../models/custom-url.js');

const urls = [
    { type: 'jimcarrey', value: '99', url: 'https://www.nme.com/wp-content/uploads/2019/07/Webp.net-resizeimage-2-2.jpg' },
    { type: 'jimcarrey', value: '37', url: 'https://cdn.vox-cdn.com/thumbor/5W2c-p-j6zwXhsAdYLeBlaVhAcs=/0x0:1347x750/1200x800/filters:focal(567x268:781x482)/cdn.vox-cdn.com/uploads/chorus_image/image/66321056/sth_ff_027r2.0.jpg' },
    { type: 'jimcarrey', value: '11', url: 'https://cdn.discordapp.com/attachments/633293499478966282/713084719851503747/GettyImages-691030296.png' },
    { type: 'jimcarrey', value: '49', url: 'https://upload.wikimedia.org/wikipedia/en/2/27/TheCableGuy.jpg' },
    { type: 'jimcarrey', value: '12', url: 'https://img1.looper.com/img/uploads/2017/10/Carrey-Riddler.jpg' },
    { type: 'jimcarrey', value: '75', url: 'https://cdn.discordapp.com/attachments/633293499478966282/713086129687101490/shutterstock_5875878f.png' },
    { type: 'jimcarrey', value: '40', url: 'https://cdn.discordapp.com/attachments/633293499478966282/713086328610357258/thumbnail.png' },
    { type: 'jimcarrey', value: '13', url: 'https://www.gannett-cdn.com/presto/2020/07/06/USAT/7df2db60-9143-443f-8611-747c0c965170-jim_carrey.JPG?crop=4255,3192,x544,y0&quality=50&width=640' },
    { type: 'jimcarrey', value: '21', url: 'https://media.apnarm.net.au/media/images/2020/06/17/v3imagesbin92c595d02242488368b128570ae59a9c-x2hfjwgjlikfl5mriu2_t1880.jpg' },
    { type: 'jimcarrey', value: '29', url: 'https://www.irishcentral.com/uploads/article-v2/2020/9/141408/Jim_Carrey_-_Getty.jpg?t=1600510778' },
    { type: 'jimcarrey', value: '131', url: 'https://www.gannett-cdn.com/-mm-/615c23ee79d6417d42c8ea5f206fc801adf8b38d/c=0-196-2784-3908/local/-/media/2016/09/19/USATODAY/USATODAY/636098973898009175-AP-Ireland-Jim-Carrey.jpg' },
    { type: 'jimcarrey', value: '73', url: 'https://static.independent.co.uk/s3fs-public/thumbnails/image/2020/07/17/07/jim-carrey-renee-zellweger.jpg' },
    { type: 'jimcarrey', value: '46', url: 'https://e3.365dm.com/20/07/2048x1152/skynews-jim-carrey-actor_5041729.jpg' },
    { type: 'jimcarrey', value: '7', url: 'https://www.telegraph.co.uk/content/dam/news/2016/07/06/Cathriona_White_wi_3457871b_trans_NvBQzQNjv4BqpJliwavx4coWFCaEkEsb3kvxIt-lGGWCWqwLa_RXJU8.jpg?impolicy=logo-overlay' },
    { type: 'jimcarrey', value: '15', url: 'https://www.oregonlive.com/resizer/6xD8xPKk3SMAg9qb1a9Sq-vO-_c=/450x0/smart/arc-anglerfish-arc2-prod-advancelocal.s3.amazonaws.com/public/JPFMBD67MVF5TNAKZ73ABBWKFY.JPG' },
    { type: 'jimcarrey', value: '88', url: 'https://www.tipsclear.in/wp-content/uploads/2020/10/Jim-Carrey-Is-Jeff-Goldblums-The-Fly-in-SNL-Pence.jpg' },
    { type: 'jimcarrey', value: '36', url: 'https://cdn.discordapp.com/attachments/633293499478966282/1209211637505065020/image.png?ex=65e61918&is=65d3a418&hm=a3f2c0af0e83027dff52395b7c54ed61daa3f7cff4886e6944fbd243a2c74867&' },
    { type: 'jimcarrey', value: '38', url: 'https://cdn.discordapp.com/attachments/633293499478966282/1209539181039063061/image.png?ex=65e74a24&is=65d4d524&hm=bbbfd8dd59ab42f181b3280f1d93600f3b70e3ece8d660dc9da0a352bf8cd96f&' },

    { type: 'dysphoria', value: '1', url: 'https://www.javascript.com/' },
    { type: 'despair', value: '1', url: 'https://www.youtube.com/watch?v=IEw5AH85Y8g' }
];

async function up() {
    await Promise.all(urls.map(obj => 
        CustomUrl.findOrCreate({
            where: {
                value: obj.value,
                url: obj.url,
                type: obj.type
            }
        })
    ));
}

module.exports = { Up: up }