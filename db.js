const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://<username>:<password>@cluster0.mongodb.net/myDatabase', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB ulandi'))
.catch(err => console.error('MongoDB ulanmadi:', err));