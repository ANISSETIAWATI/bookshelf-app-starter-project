require('dotenv').config();
const Hapi = require('@hapi/hapi');
const Inert = require('@hapi/inert');
const Path = require('path');
const webpush = require('web-push');

const routes = require('./routes');
const activityRoutes = require('./routes-activity');
const routesSchedule = require('./routes-schedule');

// Konfigurasi VAPID Keys
webpush.setVapidDetails(
    'mailto:emailanda@gmail.com',
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
);

let subscriptions = [];

const init = async () => {
    const server = Hapi.server({
        // PERBAIKAN 1: Gunakan port dinamis dari Railway
        port: process.env.PORT || 5001, 
        
        // PERBAIKAN 2: Gunakan host '0.0.0.0' agar server bisa diakses dari internet
        host: '0.0.0.0', 
        
        routes: {
            cors: {
                origin: ['*'],
                additionalHeaders: ['cache-control', 'x-requested-with', 'content-type', 'authorization']
            },
        },
    });

    await server.register(Inert);

    // --- API ROUTES ---
    server.route(routes);
    server.route(activityRoutes);
    server.route(routesSchedule);

    // --- PUSH NOTIFICATION ROUTES ---
    server.route({
        method: 'POST',
        path: '/subscribe',
        handler: (request, h) => {
            const subscription = request.payload;
            subscriptions.push(subscription);
            return h.response({ status: 'success' }).code(201);
        }
    });

    server.route({
        method: 'POST',
        path: '/send-notification',
        handler: async (request, h) => {
            const notificationPayload = JSON.stringify({
                title: 'Pesan dari Server!',
                body: 'Ada pembaruan jadwal baru untuk Anda.',
                icon: '/icon-192.png'
            });

            const promises = subscriptions.map(sub => 
                webpush.sendNotification(sub, notificationPayload).catch(err => console.error(err))
            );

            await Promise.all(promises);
            return { message: 'Notifikasi dikirim!' };
        }
    });

    // --- STATIC FILES ---
    // --- STATIC FILES ---
    server.route({
        method: 'GET',
        path: '/{param*}',
        handler: {
            directory: {
                // UBAH BARIS INI: Hapus 'bhs-indo'
                path: Path.join(__dirname, '.'), 
                redirectToSlash: true,
                index: true,
            }
        }
    });

    await server.start();
    console.log(`🚀 Server berjalan di: ${server.info.uri}`);
};

process.on('unhandledRejection', (err) => {
    console.log(err);
    process.exit(1);
});

init();