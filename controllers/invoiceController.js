const User = require('../models/userModel');
const Product = require('../models/productModel');
const Category = require('../models/categoryModel');
const Address = require('../models/addressModel');
const Wishlist = require('../models/wishlistModel');
const Cart = require('../models/cartModel');
const Order = require('../models/orderModel');
const Coupon = require('../models/couponModel');

const easyinvoice = require('easyinvoice');
const fs = require('fs');
const path = require('path');

const { parseISO, format } = require('date-fns');


// Generating the invoice using easy invoice    

const generateInvoice = async (req, res) => {
    try {

        const { orderId } = req.body;

        const orderData = await Order.findOne({_id: orderId}).populate('products.product').populate('address');

        const date = orderData.created_at;
        
        const formatconvertedDate = format(date, "MMM dd, yyyy");

        const pageOrderIdFull = orderData._id.toString();

        const pageOrderId = pageOrderIdFull.substring(0, 8);

        const products1 = orderData.products.map(item => ({
            quantity: item.quantity,
            description: item.product.name,
            price: item.product.offer == 0 ? item.product.price : item.product.salePrice // Assuming 'name' is the property in your Product model representing the product name
            // Add tax rate and price properties if available in your Product model
            // taxRate: item.product.taxRate,
            // price: item.product.price,
        }));

        const data = {
            apiKey: "free", // Please register to receive a production apiKey: https://app.budgetinvoice.com/register
            mode: "development", // Production or development, defaults to production   
            images: {
                // The logo on top of your invoice
                logo: "https://public.budgetinvoice.com/img/logo_en_original.png",
                // // The invoice background
                // background: "https://public.budgetinvoice.com/img/watermark-draft.jpg"
            },
            // Your own data
            sender: {
                company: "Phone Zee",
                address: "Sample Street 123",
                zip: "676517",
                city: "Kozhikode, Kerala",
                country: "India"
                // custom1: "custom value 1",
                // custom2: "custom value 2",
                // custom3: "custom value 3"
            },
            // Your recipient
            client: {
                company: `${orderData.address.name}`,
                address: `${orderData.address.locality}`,
                zip: `${orderData.address.pincode}`,
                city: `${orderData.address.city}, ${orderData.address.state}`,
                country: `India`
                // custom1: "custom value 1",
                // custom2: "custom value 2",
                // custom3: "custom value 3"
            },
            information: {
                // Invoice number
                OrderId: pageOrderId,
                // Invoice data
                date: formatconvertedDate,
            },
            // The products you would like to see on your invoice
            // Total values are being calculated automatically
            products: products1 ,
            // The message you would like to display on the bottom of your invoice
            // Settings to customize your invoice
            settings: {
                currency: "INR", // See documentation 'Locales and Currency' for more info. Leave empty for no currency.
                // locale: "nl-NL", // Defaults to en-US, used for number formatting (See documentation 'Locales and Currency')        
                // marginTop: 25, // Defaults to '25'
                // marginRight: 25, // Defaults to '25'
                // marginLeft: 25, // Defaults to '25'
                // marginBottom: 25, // Defaults to '25'
                // format: "A4", // Defaults to A4, options: A3, A4, A5, Legal, Letter, Tabloid
                // height: "1000px", // allowed units: mm, cm, in, px
                // width: "500px", // allowed units: mm, cm, in, px
                // orientation: "landscape" // portrait or landscape, defaults to portrait
            },
            // Translate your invoice to your preferred language
            translate: {
                // invoice: "FACTUUR",  // Default to 'INVOICE'
                // number: "Nummer", // Defaults to 'Number'
                // date: "Datum", // Default to 'Date'
                // dueDate: "Verloopdatum", // Defaults to 'Due Date'
                // subtotal: "Subtotaal", // Defaults to 'Subtotal'
                // products: "Producten", // Defaults to 'Products'
                // quantity: "Aantal", // Default to 'Quantity'
                // price: "Prijs", // Defaults to 'Price'
                // productTotal: "Totaal", // Defaults to 'Total'
                // total: "Totaal", // Defaults to 'Total'
                // taxNotation: "btw" // Defaults to 'vat'
            },
        
            // Customize enables you to provide your own templates
            // Please review the documentation for instructions and examples
            // "customize": {
            //      "template": fs.readFileSync('template.html', 'base64') // Must be base64 encoded html 
            // }
        };
        
        const invoiceFolderPath = path.join(__dirname, '../invoice');
        const invoiceFilePath = path.join(invoiceFolderPath, `invoice-${orderData._id}.pdf`);

        //Create your invoice! Easy!
        easyinvoice.createInvoice(data, async function (result) {
            //The response will contain a base64 encoded PDF file

            await fs.promises.mkdir(invoiceFolderPath, { recursive: true });
            await fs.promises.writeFile(invoiceFilePath, result.pdf, 'base64');

            res.sendFile(invoiceFilePath, {
                headers: {
                    'Content-Disposition': `attachment; filename="invoice-${orderData._id}.pdf"`,
                },
            }, (err) => {
                if (err) {
                    const downloadError = new CustomError(500, 'Error: Unable to download the PDF file');
                    console.log(downloadError);
                }
            });

        });
        
    } catch (error) {
        console.log(error.message);
    };
};



module.exports = {
    generateInvoice,

};