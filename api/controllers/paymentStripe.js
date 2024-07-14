const mongoose = require("mongoose");
const Stripe = require('stripe');
const stripe = new Stripe('sk_test_51OtF7S01rw9U6daMzSt8PEsZeIxIMQlA0V3rxqLNYCAoTfkgxtr9IdnDomd1xjTqlS4e1LonhJarsGhaY6IIcqSB00areY2QuE');

const VentaDetail = require("../models/ventaDetail");
const Venta = require("../models/ventaSchema");
const User = require("../models/user");
const generarCodigoPedido = () => {
  const longitud = 6;
  const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let codigoPedido = '';

  for (let i = 0; i < longitud; i++) {
    const caracterAleatorio = caracteres.charAt(Math.floor(Math.random() * caracteres.length));
    codigoPedido += caracterAleatorio;
  }

  return codigoPedido;
};
exports.createSession = async (req, res) => {
  try {
    const { totalneto, tipoEntrega, dateselect, productos, datoscliente, instruction, success_url, cancel_url } = req.body;

    const isValidURL = (string) => {
      try {
        new URL(string);
        return true;
      } catch (_) {
        return false;
      }
    };

    const line_items = productos.map(producto => {
      if (!isValidURL(producto.image)) {
        throw new Error(`URL de imagen no válida: ${producto.image}`);
      }

      return {
        price_data: {
          currency: 'mxn',
          product_data: {
            name: producto.name,
            images: producto.image
          },
          unit_amount: producto.precio * 100,
        },
        quantity: producto.cantidad,
      };
    });

    // Imprimir los detalles de line_items para depuración
    console.log('Detalles de line_items:', JSON.stringify(line_items, null, 2));

    const customerName = `${datoscliente.name} ${datoscliente.paternalLastname} ${datoscliente.maternalLastname}`;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: "payment",
      line_items,
      success_url: "https://austins.vercel.app/payment/order-success?token={CHECKOUT_SESSION_ID}",
      cancel_url: "https://austins.vercel.app/payment/order-detail?deliveryOption=inStore",
      customer_email: datoscliente.email,
      metadata: {
        tipoEntrega,
        dateselect,
        instruction,
        empresa: "Austins",
      },
    });

    let user = await User.findOne({ email: datoscliente.email });

    if (!user) {
      user = new User({
        _id: new mongoose.Types.ObjectId(),
        name: datoscliente.name,
        paternalLastname: datoscliente.paternalLastname,
        maternalLastname: datoscliente.maternalLastname,
        phone: datoscliente.phone,
        email: datoscliente.email,
        rol: 'GUEST',
        password: 'contraseñaPorDefecto',
      });
      await user.save();
    }

    const ventaDetail = new VentaDetail({
      _id: new mongoose.Types.ObjectId(),
      user: user._id,
      products: productos.map(producto => ({
        product: producto.id,
        quantity: producto.cantidad,
      })),
      totalAmount: totalneto,
      deliveryType: tipoEntrega,
      deliveryDate: dateselect,
      instruction: instruction,
      status: 'PENDING',
    });
    await ventaDetail.save();

    const venta = new Venta({
      _id: new mongoose.Types.ObjectId(),
      user: user._id,
      details: ventaDetail._id,
      totalAmount: totalneto,
      stripeSessionID: session.id,
      trackingNumber:generarCodigoPedido()
    });
    await venta.save();

    // const updatedSuccessUrl = `https://austins.vercel.app/payment/order-success?token=${session.id}`;

    return res.json({ url: session.url });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};
