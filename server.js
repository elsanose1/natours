const mongoose = require('mongoose');
const dotenv = require('dotenv');

// shutdown server on error
process.on('uncaughtException' , err =>{
  console.log(err.name , err.message);
  console.log('uncaught Exception  ');
  process.exit(1)
})
dotenv.config({path : './config.env'});

const app = require('./app');



mongoose
  .connect(process.env.DATABASE_LOCAL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => console.log('DB connection successful'));



const { PORT } = process.env;
const server = app.listen(PORT, async () => {
  console.log(`Server is running on port : ${PORT}`);
})

process.on('unhandledRejection' , err =>{
  console.log(err.name , err.message);
  console.log('Unhandled Rejection  ');
  server.close(()=>{
    process.exit(1)
  })
})
