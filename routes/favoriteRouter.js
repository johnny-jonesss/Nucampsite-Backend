const express = require('express');
const Favorite = require('../models/favorite');
const authenticate = require('../authenticate');
const cors = require('./cors');

const favoriteRouter = express.Router();

favoriteRouter.route('/')
    .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
    .get(cors.cors, (req, res, next) => {
        Favorite.find()
        .populate('User')
        .populate('Campsites')
            .then(favorites => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorites);
            })
            .catch(err => next(err));
    })
    .post(cors.corsWithOptions, authenticate.verifyUser,(req, res, next) => {
        Favorite.create(req.body)
            .then(favorite => {
                if (favorite) {
                    req.body.forEach(newFavorite => {
                        // Prevent duplicate favorites
                        const newFavIsNotInCampsites = !favorite.campsites.includes(newFavorite._id)
                        if (newFavIsNotInCampsites) {
                            favorite.campsites.push(newFavorite)
                        }
                    })
                    favorite.save()
                        .then(favorite => {
                            console.log('Favorite Created ', favorite);
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(favorite);
                        })
                        .catch(err => next(err))
                } else {
                    Favorite.create({ user: req.user._id })
                        .then(favorite => {
                            req.body.forEach(newFavorite => {
                                // Prevent duplicate favorites
                                const newFavIsNotInCampsites = !favorite.campsites.includes(newFavorite._id)
                                if (newFavIsNotInCampsites) {
                                    favorite.campsites.push(newFavorite)
                                }
                            })
                            favorite.save()
                                .then(favorite => {
                                    console.log('Favorite Created ', favorite);
                                    res.statusCode = 200;
                                    res.setHeader('Content-Type', 'application/json');
                                    res.json(favorite);
                                })
                                .catch(err => next(err))
                        })
                        .catch(err => next(err))
                }
            })
            .catch(err => next(err));
    })
    .put(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
        res.statusCode = 403;
        res.end('PUT operation not supported on /favorites');
    })
    .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorite.findOneAndDelete({ user: req.user._id })
            .then(favorite => {
                if (favorite) {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favorite);
                } else {
                    res.setHeader('Content-Type', 'text/plain');
                    res.end('You do not have any favorites to delete.');
                }
            })
            .catch(err => next(err));
    });

favoriteRouter.route('/:campsiteId')
    .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
    .get(cors.cors, (req, res, next) => {
        res.statusCode = 403
        res.end(`GET operation not supported for /favorite/${req.params.campsiteId}`)
    })
    .post(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
        Favorite.findOne( { user: req.user._id } )
        .then(favorite => {
            if (favorite) {
                    const newFavIsNotInCampsites = !favorite.campsites.includes(req.params.campsiteId)
                    if (newFavIsNotInCampsites) {
                        favorite.campsites.push(req.params.campsiteId)
                        favorite.save()
                            .then(favorite => {
                                console.log('Favorite Created ', favorite);
                                res.statusCode = 200;
                                res.setHeader('Content-Type', 'application/json');
                                res.json(favorite);
                            })
                            .catch(err => next(err))
                    }
            } else {
                Favorite.create({ user: req.user._id, campsites: [req.params.campsiteId] })
                    .then(favorite => {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(favorite);
                    })
                    .catch(err => next(err))
            }
        })
        .catch(err => next(err));
    })
    .put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        res.statusCode = 403
        res.end(`GET operation not supported for /favorite/${req.params.campsiteId}`)
    })
    .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorite.campsites.indexOf(req.params.campsiteId)
        const index = Favorite.campsites.indexOf(req.params.campsiteId)
            .then(favorite => {
                if (index >= 0) {
                    favorite.campsites.splice(index, 1)
                    favorite.save()
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favorite);
                } else {
                    res.setHeader('Content-Type', 'text/plain');
                    res.end('You do not have any favorites to delete.');
                }
                
            })
            .catch(err => next(err));
    });

    module.exports = favoriteRouter;