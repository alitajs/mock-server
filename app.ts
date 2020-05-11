import createError from 'http-errors';
import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import { createProxyMiddleware } from 'http-proxy-middleware';
import compression from 'compression';
import cors from 'cors';
import indexRouter from './routes/index';
import { getMockData, matchMock } from './utils';

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(compression());
app.use(logger('dev'));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use(
  '/api',
  createProxyMiddleware({
    target: 'https://proapi.azurewebsites.net/',
    changeOrigin: true,
    pathRewrite: { '^': '' },
  }),
);
const ignore = [
  // ignore mock files under node_modules
  'node_modules/**',
  // ...(userConfig?.mock?.exclude || []),
];
const { mockData,
  mockPaths,
  mockWatcherPaths, } = getMockData({
    cwd: `${process.cwd()}/dist`,
    ignore,
    // registerBabel,
  })
app.use((req, res, next) => {
  const match = mockData && matchMock(req, mockData);
  if (match) {
    return match.handler(req, res, next);
  } else {
    return next();
  }
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err: Error, req: Request, res: Response, next: NextFunction) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(500);
  res.render('error');
});

module.exports = app;
