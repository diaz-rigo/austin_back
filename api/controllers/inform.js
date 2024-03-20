const Purchase = require('../models/Purchase');
const PurchaseDetail = require('../models/purchaseDetail');
const User = require('../models/user');

// Controlador para generar el Informe de Ventas por Período de Tiempo
exports.salesReport = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        // Obtener las ventas totales durante el período de tiempo especificado
        const sales = await Purchase.aggregate([
            {
                $match: {
                    createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) }
                }
            },
            {
                $group: {
                    _id: null,
                    totalSales: { $sum: '$totalAmount' },
                    totalOrders: { $sum: 1 }
                }
            }
        ]);

        // Obtener los productos más vendidos durante el período de tiempo especificado
        const topProducts = await PurchaseDetail.aggregate([
            {
                $match: {
                    createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) }
                }
            },
            {
                $unwind: '$products'
            },
            {
                $group: {
                    _id: '$products.product',
                    totalQuantity: { $sum: '$products.quantity' }
                }
            },
            {
                $sort: { totalQuantity: -1 }
            },
            {
                $limit: 5 // Mostrar los 5 productos más vendidos
            }
        ]);

        // Obtener los clientes más frecuentes durante el período de tiempo especificado
        const topCustomers = await Purchase.aggregate([
            {
                $match: {
                    createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) }
                }
            },
            {
                $group: {
                    _id: '$user',
                    totalAmount: { $sum: '$totalAmount' }
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'userInfo'
                }
            },
            {
                $addFields: {
                    name: { $arrayElemAt: ['$userInfo.name', 0] }
                }
            },
            {
                $sort: { totalAmount: -1 }
            },
            {
                $limit: 5 // Mostrar los 5 clientes con mayor gasto
            }
        ]);

        res.json({
            sales,
            topProducts,
            topCustomers
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al generar el informe de ventas.' });
    }
};

