const path = require('path')
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helemt = require('helmet');
const xss = require('xss-clean');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const compression = require('compression')

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const bookingRouter = require('./routes/bookingRoutes')
const viewRouter = require('./routes/viewRouters')

const AppError = require('./utils/appError');
const errorHandler = require('./controllers/errorController');

const app = express();
// 1 Global middlewares
// app.use(cors())


app.set('view engine','pug');
app.set('views' , path.join(__dirname,'views'))

// serving static files

app.use(express.static(path.join(__dirname,'public')))


// security HTTP headders
app.use(helemt({
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: {
        allowOrigins: ['*']
    },
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ['*'],
            scriptSrc: ["* data: 'unsafe-eval' 'unsafe-inline' blob:"]
        }
    }
}))

if (process.env.NODE_ENV == "development") {
    app.use(morgan('dev'))
}

// limit requests per IP
const limiter = rateLimit({
    max : 100,
    windowMs : 60 * 60 * 1000 ,
    message : 'to many requests from this IP , please try again in an hour'
})

app.use('/api',limiter)

// body parser
app.use(express.json({
    limit : '10kb'
}))

app.use(cookieParser())

// Data sanitization from Nosql query injection &&  XSS
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss())

// Prevent Parameter Pollution
app.use(hpp({
    whitelist : ['duration' , 'price' , 'maxGroupSize', 'ratingsAverage', 'ratingsQuantity']
}))

app.use(compression())


// 3 routes


app.use('/',viewRouter)
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/booking', bookingRouter);

app.all('*' , (req, res, next)=>{
    const err = new AppError(`Can't find ${req.originalUrl} on this server!` ,404)
    next(err)
})

app.use(errorHandler)
module.exports = app