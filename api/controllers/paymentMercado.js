const mercadopago = require("mercadopago");

exports.createOrder = async (req, res) => {
  mercadopago.configure({
    access_token: 'TEST-3330887840036989-031517-1525a7d106e6695f0210eb568cf7d397-1730195078',
  });
  try {
    const { totalneto, tipoEntrega, dateselect, productos, datoscliente, instrucion } = req.body;

    const items = productos.map(producto => ({
      title: producto.name,
      unit_price: parseFloat(producto.precio),
      currency_id: "MXN",
      quantity: producto.cantidad,
    }));

    const preference = {
      items,
      back_urls: {
        success: "https://austins.vercel.app/payment/order-success",
        pending: "https://austins.vercel.app/pending",
        failure: "https://austins.vercel.app/payment/order-detail?deliveryOption=inStore",
        // failure: "http://localhost:4200/payment/order-detail?deliveryOption=inStore",
      },
    };

    const result = await mercadopago.preferences.create(preference);

    console.log(result);

    // Check if the response contains the init_point
    if (result && result.body && result.body.init_point) {
      // Return the init_point URL in the response
      // url = res.sandbox_init_point

      // return res.json({ url: result.body.init_point });
      return res.json({ url: result.body.sandbox_init_point });
    } else {
      console.error('init_point not found in the response');
      return res.status(500).json({ message: 'init_point not found in the response' });
    }
  } catch (error) {
    return res.status(500).json({ message: "Something went wrong", error });
  }
};

exports.receiveWebhook = async (req, res) => {
  try {
    const payment = req.body;
    console.log(payment);

    if (payment.action === "payment.created") {
      // Handle payment created event
      console.log("Payment created:", payment.data.id);
    }

    res.sendStatus(200);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};
