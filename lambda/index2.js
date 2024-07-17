const Alexa = require('ask-sdk-core');
const axios = require('axios');

const DOCUMENT_ID_launchAPL = "launchAPL";
const DOCUMENT_ID_loginSuccessAPL = "loginSuccessAPL";
const DOCUMENT_ID_listProductsAPL = "listProductsAPL";
const DOCUMENT_ID_selectProductAPL = "selectProductAPL";

const createDatasourceSelectProductAPL_old = (productData) => {
    if (!productData || !productData.images || !productData.images.length) {
        console.error('Product data is incomplete or missing.');
        return {};
    }

    return {
        "detailImageRightData": {
            "type": "object",
            "objectId": "detailImageRightSample",
            "backgroundImage": {
                "contentDescription": null,
                "smallSourceUrl": null,
                "largeSourceUrl": null,
                "sources": [
                    {
                    "url": "https://res.cloudinary.com/dfd0b4jhf/image/upload/v1721114796/public__/gbqksjlqpcjcfc5kpi86.png",
                    "size": "large"
                }
                ]
            },
            "title": productData.name,
            "subtitle": `Precio: ${productData.price} pesos`,
            "image": {
                "contentDescription": productData.name,
                "smallSourceUrl": null,
                "largeSourceUrl": null,
                "sources": [
                    {
                        "url": productData.images[0],
                        "size": "large"
                    }
                ]
            },
            "textContent": {
                "primaryText": {
                    "type": "PlainText",
                    "text": productData.description
                },
                "secondaryText": {
                    "type": "PlainText",
                    "text": `Categoría: ${productData.category}`
                },
                "tertiaryText": {
                    "type": "PlainText",
                    "text": `Disponibilidad: ${productData.quantity}`
                }
            },
            "buttons": [
                {
                    "text": "Comprar",
                    "action": "buy"
                }
            ],
            "logoUrl": ""
        }
    };
};
const createDatasourceSelectProductAPL = (productData) => {
    if (!productData || !productData.images || !productData.images.length) {
        console.error('Product data is incomplete or missing.');
        return {};
    }

    return {
      "detailImageRightData": {
        "type": "object",
        "objectId": "detailImageRightSample",
        "backgroundImage": {
            "contentDescription": null,
            "smallSourceUrl": null,
            "largeSourceUrl": null,
            "sources": [
                {
                    "url": "https://res.cloudinary.com/dfd0b4jhf/image/upload/v1721114796/public__/gbqksjlqpcjcfc5kpi86.png",
                    "size": "large"
                }
            ]
        },
           "title": productData.name,
            "subtitle": `Precio: ${productData.price} pesos`,
        "image": {
            "contentDescription": "",
            "smallSourceUrl": null,
            "largeSourceUrl": null,
            "sources": [
                    {
                        "url": productData.images[0],
                        "size": "large"
                    }
                ]
        },
        "textContent": {
            "primaryText": {
                "type": "PlainText",
                "text": productData.name
            },
            "rating": {
                "number": 4.5,
            },
            "locationText": {
                "type": "PlainText",
                "text": productData.description
            },
            "secondaryText": {
                "type": "PlainText",
                "text": `Categoría: ${productData.category}`
            }
        },
    "buttons": [
                {
                    "text": "Comprar",
                    "action": "buy"
                }
            ],
        "logoUrl": ""
    }
    };
};


const createDatasourceListProductsAPL = (products) => {
    return {
        "imageListData": {
            "type": "object",
            "objectId": "imageListSample",
            "backgroundImage": {
                "contentDescription": null,
                "smallSourceUrl": null,
                "largeSourceUrl": null,
                "sources": [
                    {
                        "url": "https://res.cloudinary.com/dfd0b4jhf/image/upload/v1721112808/public__/vw8mwcvttlgoyqxghubd.png",
                        "size": "large"
                    }
                ]
            },
            "title": "Lo más reciente",
            "listItems": products.map(product => ({
                "primaryText": product.name,
                "imageSource": product.images[0]
            })),
            "logoUrl": "",
            "hintText": "Prueba diciendo, \"Alexa, selecciona el número 1\""
        }
    };
};

const datasource_loginSuccessAPL = (userName) => ({
    "headlineTemplateData": {
        "type": "object",
        "objectId": "headlineSample",
        "properties": {
            "backgroundImage": {
                "contentDescription": null,
                "smallSourceUrl": null,
                "largeSourceUrl": null,
                "sources": [
                    {
                        "url": "https://res.cloudinary.com/dfd0b4jhf/image/upload/v1721109016/public__/lndffumjqzfzw0u9mujk.png",
                        "size": "large"
                    }
                ]
            },
            "textContent": {
                "primaryText": {
                    "type": "PlainText",
                    "text": `Bienvenido ${userName}`
                }
            },
            "logoUrl": "",
            "hintText": "Prueba diciendo, \"Alexa, Muestra los productos\""
        }
    }
});

const datasource_launchAPL = {
    "imageListData": {
        "type": "object",
        "objectId": "paginatedListSample",
        "title": "Gallery",
        "listItems": [
            {
                "primaryText": "AUSTINS",
                "secondaryText": "BIENVENIDO",
                "imageSource": "https://res.cloudinary.com/dfd0b4jhf/image/upload/v1709327171/public__/m2z2hvzekjw0xrmjnji4.jpg"
            },
            {
                "primaryText": "AUSTINS",
                "secondaryText": "BIENVENIDO",
                "imageSource": "https://res.cloudinary.com/dfd0b4jhf/image/upload/v1709327171/public__/mbpozw6je9mm8ycsoeih.jpg"
            }
        ],
        "logoUrl": ""
    }
};

const createDirectivePayload = (aplDocumentId, dataSources = {}, tokenId = "documentToken") => {
    return {
        type: "Alexa.Presentation.APL.RenderDocument",
        token: tokenId,
        document: {
            type: "Link",
            src: "doc://alexa/apl/documents/" + aplDocumentId
        },
        datasources: dataSources
    }
};

const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
    },
    handle(handlerInput) {
        const speakOutput = '¡Bienvenido a Autins Huejutla! Puedes iniciar sesión diciendo "Inicia sesión". ¿Cómo puedo ayudarte hoy?';

        if (Alexa.getSupportedInterfaces(handlerInput.requestEnvelope)['Alexa.Presentation.APL']) {
            const aplDirective = createDirectivePayload(DOCUMENT_ID_launchAPL, datasource_launchAPL);
            handlerInput.responseBuilder.addDirective(aplDirective);
        } else {
            console.log("APL no es soportado en este dispositivo.");
        }
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

const LoginIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'LoginIntent';
    },
    async handle(handlerInput) {
        const { name, phone } = handlerInput.requestEnvelope.request.intent.slots;
        const userName = name.value;
        const userPhone = phone.value;

        // Función para dividir el número de teléfono en segmentos de dos dígitos
        function spellPhoneNumber(phoneNumber) {
            return phoneNumber.match(/.{1,2}/g).join(' ');
        }

        try {
            const response = await axios.post('https://austin-b.onrender.com/alexa/sign-in', {
                name: userName,
                phone: userPhone
            });

            const userData = response.data.user;

            if (userData) {
                const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
                sessionAttributes.userId = userData._id; // Guardar userId en sessionAttributes
                handlerInput.attributesManager.setSessionAttributes(sessionAttributes);

                const spelledPhone = spellPhoneNumber(userData.phone);
                const speakOutput = `He registrado tu nombre como ${userData.name} ${userData.paternalLastname} ${userData.maternalLastname} y tu número de teléfono como ${spelledPhone}. Has iniciado sesión exitosamente. ¿Cómo puedo asistirte hoy?`;

                if (Alexa.getSupportedInterfaces(handlerInput.requestEnvelope)['Alexa.Presentation.APL']) {
                    const aplDirective = createDirectivePayload(DOCUMENT_ID_loginSuccessAPL, datasource_loginSuccessAPL(`${userData.name} ${userData.paternalLastname} ${userData.maternalLastname}`));
                    handlerInput.responseBuilder.addDirective(aplDirective);
                } else {
                    console.log("APL no es soportado en este dispositivo.");
                }

                return handlerInput.responseBuilder
                    .speak(speakOutput)
                    .reprompt(speakOutput)
                    .getResponse();
            } else {
                throw new Error('No se pudo obtener la información del usuario.');
            }
        } catch (error) {
            console.error(`Error al iniciar sesión: ${error.message}`);
            const speakOutput = 'No pude registrar tu información. Por favor, proporciona tu nombre y número de teléfono nuevamente.';
            return handlerInput.responseBuilder
                .speak(speakOutput)
                .reprompt(speakOutput)
                .getResponse();
        }
    }
};

const WelcomeIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'WelcomeIntent';
    },
    handle(handlerInput) {
        const speakOutput = '¡Puedes iniciar sesión diciendo "Inicia sesión". ¿Cómo puedo ayudarte hoy?';
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

const ListProductsIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'ListProductsIntent';
    },
    async handle(handlerInput) {
        try {
            const response = await axios.get('https://austin-b.onrender.com/product');
        const products = response.data; // Asumiendo que la respuesta de la API es un array de productos

            if (products.length > 0) {
                const productNames = products.map(product => product.name).join(', ');
                const speakOutput =`Estos son los productos disponibles: ${productNames}. ¿Cuál te interesa?`;
                if (Alexa.getSupportedInterfaces(handlerInput.requestEnvelope)['Alexa.Presentation.APL']) {
                    const aplDirective = createDirectivePayload(DOCUMENT_ID_listProductsAPL, createDatasourceListProductsAPL(products));
                    handlerInput.responseBuilder.addDirective(aplDirective);
                } else {
                    console.log("APL no es soportado en este dispositivo.");
                }
                return handlerInput.responseBuilder
                    .speak(speakOutput)
                    .reprompt(speakOutput)
                    .getResponse();
            } else {
                throw new Error('No se encontraron productos.');
            }
        } catch (error) {
            console.error(`Error al obtener productos: ${error.message}`);
            const speakOutput = 'No pude obtener la lista de productos en este momento. Por favor, inténtalo más tarde.';
            return handlerInput.responseBuilder
                .speak(speakOutput)
                .reprompt(speakOutput)
                .getResponse();
        }
    }
};

const SelectProductIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'SelectProductIntent';
    },
    async handle(handlerInput) {
        const { product } = handlerInput.requestEnvelope.request.intent.slots;
        const selectedProduct = product.value;

        if (selectedProduct) {
            const response = await axios.get(`https://austin-b.onrender.com/product/name/${encodeURIComponent(selectedProduct)}`);
            const productData = response.data[0]; // Asumiendo que la API devuelve un array
            const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
            sessionAttributes.productId = productData._id; // Guardar productId en sessionAttributes
            sessionAttributes.totalPrice = productData.price; // Guardar totalPrice en sessionAttributes
            handlerInput.attributesManager.setSessionAttributes(sessionAttributes);

            const speakOutput = `Has seleccionado ${selectedProduct}. ¿Quieres confirmar la compra? El precio es ${productData.price} pesos y tenemos ${productData.quantity} en stock.`;

            if (Alexa.getSupportedInterfaces(handlerInput.requestEnvelope)['Alexa.Presentation.APL']) {
                const aplDirective = createDirectivePayload(DOCUMENT_ID_selectProductAPL, createDatasourceSelectProductAPL(productData));
                handlerInput.responseBuilder.addDirective(aplDirective);
            } else {
                console.log("APL no es soportado en este dispositivo.");
            }

            return handlerInput.responseBuilder
                .speak(speakOutput)
                .reprompt('¿Quieres confirmar la compra de ' + selectedProduct + '?')
                .getResponse();
        } else {
            const speakOutput = 'No pude identificar el producto que seleccionaste. Por favor, intenta nuevamente.';
            return handlerInput.responseBuilder
                .speak(speakOutput)
                .reprompt('¿Qué producto quieres seleccionar?')
                .getResponse();
        }
    }
};


const ConfirmPurchaseIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'ConfirmPurchaseIntent';
    },
    async handle(handlerInput) {
        const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        const userId = sessionAttributes.userId;
        const productId = sessionAttributes.productId;
        const quantity = 1; // Puedes obtener esto de alguna parte del contexto si es necesario
        const totalPrice = sessionAttributes.totalPrice;

        try {
            // await axios.post('https://austin-b.onrender.com/alexa/compra', {
            //     userId: userId,
            //     productId: productId,
            //     quantity: quantity,
            //     totalPrice: totalPrice
            // });

            // const speakOutput = 'Compra confirmada. Gracias por tu compra. ¿Puedo ayudarte en algo más?';
            const speakOutput = `Compra confirmada. Gracias por tu compra. ¿Puedo ayudarte en algo más? ${userId} ${productId}`;
            return handlerInput.responseBuilder
                .speak(speakOutput)
                .reprompt('¿Puedo ayudarte en algo más?')
                .getResponse();
        } catch (error) {
            console.error(`Error al confirmar la compra: ${error.message}`);
            const speakOutput = 'No pude confirmar tu compra en este momento. Por favor, inténtalo más tarde.';
            return handlerInput.responseBuilder
                .speak(speakOutput)
                .reprompt('¿Puedo ayudarte en algo más?')
                .getResponse();
        }
    }
};


const HelpIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
        const speakOutput = 'Puedes decirme que te inicie sesión o mostrar productos. ¿Cómo puedo ayudarte?';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

const CancelAndStopIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && (Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.CancelIntent'
                || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.StopIntent');
    },
    handle(handlerInput) {
        const speakOutput = '¡Adiós!';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse();
    }
};

const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        console.log(`La sesión terminó con el motivo: ${Alexa.getRequestReason(handlerInput.requestEnvelope)}`);

        return handlerInput.responseBuilder.getResponse();
    }
};

const IntentReflectorHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest';
    },
    handle(handlerInput) {
        const intentName = Alexa.getIntentName(handlerInput.requestEnvelope);
        const speakOutput = `Acabas de activar ${intentName}`;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse();
    }
};

const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        console.log(`Error handled: ${error.message}`);

        const speakOutput = 'Lo siento, tuve problemas para hacer lo que me pediste. Por favor, inténtalo de nuevo.';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

exports.handler = Alexa.SkillBuilders.custom()
    .addRequestHandlers(
        LaunchRequestHandler,
        LoginIntentHandler,
        WelcomeIntentHandler,
        ConfirmPurchaseIntentHandler,
        ListProductsIntentHandler,
        SelectProductIntentHandler,
        HelpIntentHandler,
        CancelAndStopIntentHandler,
        SessionEndedRequestHandler,
        IntentReflectorHandler
    )
    .addErrorHandlers(
        ErrorHandler
    )
    .lambda();
