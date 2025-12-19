const { 
    addScheduleHandler, 
    getAllSchedulesHandler, 
    deleteScheduleByIdHandler,
    updateTaskHandler
} = require('./handler-schedule'); // Pastikan nanti buat file handlernya juga

const routesSchedule = [
    {
        method: 'PATCH',
        path: '/schedules/{id}', // Mengincar ID jadwal tertentu
        handler: updateTaskHandler,
    },
    {
        method: 'POST',
        path: '/schedules',
        handler: addScheduleHandler,
    },
    {
        method: 'GET',
        path: '/schedules',
        handler: getAllSchedulesHandler,
    },
    {
        method: 'DELETE',
        path: '/schedules/{id}',
        handler: deleteScheduleByIdHandler,
    },
];

module.exports = routesSchedule;