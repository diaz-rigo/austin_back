
const clientView = require('../models/modelo');

exports.getAllOrders = async (req, res) => {
  try {
    const orders = await clientView.find();
    console.log('Orders fetched:', orders);  // Mensaje de depuración
    res.status(200).json(orders);
  } catch (err) {
    console.error('Error fetching orders:', err);  // Mensaje de depuración
    res.status(500).json({ message: err.message });
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const order = await clientView.findById(req.params.id);
    if (order == null) {
      console.log('Order not found with ID:', req.params.id);  // Mensaje de depuración
      return res.status(404).json({ message: 'Order not found' });
    }
    console.log('Order fetched:', order);  // Mensaje de depuración
    res.status(200).json(order);
  } catch (err) {
    console.error('Error fetching order:', err);  // Mensaje de depuración
    res.status(500).json({ message: err.message });
  }
};
