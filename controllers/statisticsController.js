const User = require('../models/userModel');
const Product = require('../models/productModel');
const Category = require('../models/categoryModel');
const Address = require('../models/addressModel');
const Wishlist = require('../models/wishlistModel');
const Cart = require('../models/cartModel');
const Order = require('../models/orderModel');
const Coupon = require('../models/couponModel');


const { parseISO, format, startOfToday, startOfYesterday, subWeeks, subMonths, subYears, startOfWeek, endOfWeek, startOfMonth, startOfYear, endOfDay, startOfDay, isWithinInterval, addDays, subDays, isSameDay, getYear } = require('date-fns');

const PDFDocument = require('pdfkit');
const path = require('path');
const fs = require('fs');
const ejs = require('ejs');

// To load the report page with some data

const loadStatistics = async (req, res) => {
    try {
        let ordersToFrontend = [];
        let dateArray = [];
        let quantityArray = [];
        let totalQuantity = 0;
        let totalOrderAmount = 0;

        const orderData = await Order.find({ order_status: 'Delivered' })
            .populate('user')
            .populate('products.product')
            .populate('address');

        const todayDate = Date.now();
        const formatTodaysConvertedDate = format(todayDate, "MMM dd, yyyy");

        for (let i = 0; i < orderData.length; i++) {
            const date = orderData[i].created_at;
            const formatconvertedDate = format(date, "MMM dd, yyyy");

            if (formatconvertedDate == formatTodaysConvertedDate) {
                totalOrderAmount += orderData[i].order_total;
                ordersToFrontend.push(orderData[i]);
                dateArray.push(formatconvertedDate);
            }

        }

        for (let i = 0; i < ordersToFrontend.length; i++) {
            
            for (let j = 0; j < ordersToFrontend[i].products.length; j++) {
                totalQuantity += ordersToFrontend[i].products[j].quantity;
            }
            
            quantityArray.push(totalQuantity);

            totalQuantity = 0;

        };

        const overallTotalQuantity = quantityArray.reduce((accum, elem) => {
            return accum += elem
        }, 0)

        const totalProfit = ( overallTotalQuantity * 900 );

        res.render('salesReport', {
            activeStatsMessage: 'active',
            orderData: ordersToFrontend,
            dates: dateArray,
            quantityArray,
            dateRange: 'today',
            totalOrders: ordersToFrontend.length,
            totalOrderAmount,
            totalProfit,
            dateToShow: 'Today'
             
        });
    } catch (error) {
        console.log(error.message);
    }
};


// To filter the report data

const filterReports = async (req, res) => {
    try {

        let ordersToFrontend = [];
        let dateArray = [];
        let quantityArray = [];
        let totalQuantity = 0;
        let totalProfit = 0;
        let totalOrderAmount = 0;
        let dateToShow = '';

        const { dateRange, startDate, endDate } = req.body;

        let startDateFilter, endDateFilter;
        const today = new Date();

        switch (dateRange) {
            case 'today':
                startDateFilter = startOfToday();
                endDateFilter = endOfDay(today);
                dateToShow = 'Today';
                break;
            case 'yesterday':
                startDateFilter = startOfYesterday();
                endDateFilter = startOfToday();
                dateToShow = 'Yesterday';
                break;
            case 'lastWeek':
                startDateFilter = startOfWeek(subWeeks(today, 1));
                endDateFilter = endOfDay(today);
                dateToShow = 'Last Week';
                break;
            case 'lastMonth':
                startDateFilter = startOfMonth(subMonths(today, 1));
                endDateFilter = endOfDay(today);
                dateToShow = 'Last Month';
                break;
            case 'lastYear':
                startDateFilter = startOfYear(subYears(today, 1));
                endDateFilter = endOfDay(today);
                dateToShow = 'Last Year';
                break;
            case 'custom':
                if (startDate && endDate) {
                    startDateFilter = parseISO(startDate);
                    endDateFilter = parseISO(endDate);
                }
                dateToShow = `${startDate} - ${endDate}`;
                break;
            default:
                startDateFilter = startOfToday();
                endDateFilter = endOfDay(today);
                dateToShow = 'Today';
                break;
        }

        const orderData = await Order.find({
            order_status: 'Delivered',
            created_at: {
                $gte: startDateFilter,
                $lte: endDateFilter
            }
        }).populate('user').populate('products.product').populate('address');

        for (let i = 0; i < orderData.length; i++) {
            const date = orderData[i].created_at;
            const formatconvertedDate = format(date, "MMM dd, yyyy");

            // for (let j = 0; j < orderData[i].products.length; j++) {
            //     totalQuantity += orderData[i].products[j].quantity;
            // }

            totalOrderAmount += orderData[i].order_total;
            
            ordersToFrontend.push(orderData[i]);
            dateArray.push(formatconvertedDate);
        }

        for (let i = 0; i < ordersToFrontend.length; i++) {
            
            for (let j = 0; j < ordersToFrontend[i].products.length; j++) {
                totalQuantity += ordersToFrontend[i].products[j].quantity;
            }
            
            quantityArray.push(totalQuantity);

            totalQuantity = 0;

        };

        const overallTotalQuantity = quantityArray.reduce((accum, elem) => {
            return accum += elem
        }, 0)

        totalProfit = ( overallTotalQuantity * 900 );

        res.render('salesReport', { activeStatsMessage: 'active', orderData: ordersToFrontend, dates: dateArray, quantityArray, dateRange, totalOrders: ordersToFrontend.length, totalOrderAmount, totalProfit, dateToShow });
        
    } catch (error) {
        console.log(error.message);
    };
};

// const downloadSalesReport = (req, res) => {
//     try {
//         const { dateRange, startDate, endDate, totalOrders, totalOrderAmount, totalProfit, orderData } = req.body;

//         // Ensure the reports directory exists
//         const reportsDir = path.join(__dirname, '..', 'public', 'reports');
//         if (!fs.existsSync(reportsDir)) {
//             fs.mkdirSync(reportsDir, { recursive: true });
//         }

//         // Create a new PDF document
//         const doc = new PDFDocument();
//         const filePath = path.join(reportsDir, 'sales-report.pdf');

//         doc.pipe(fs.createWriteStream(filePath));

//         // Add title
//         doc.fontSize(20).text('Sales Report', { align: 'center' });
//         doc.moveDown();

//         // Add date range
//         // doc.fontSize(12).text(`Date Range: ${startDate} - ${endDate}`);
//         // doc.moveDown();

//         // Table headers
//         doc.fontSize(12).text('Date', { width: 100, continued: true });
//         doc.text('Product', { width: 200, continued: true });
//         doc.text('Order Total', { width: 100, continued: true });
//         doc.text('Quantity Sold', { width: 100, continued: true });
//         doc.text('Total Revenue', { width: 100 });
//         doc.moveDown();

//         // Table rows
//         orderData.forEach(order => {
//             doc.text(order.date, { width: 100, continued: true });
//             doc.text(order.product, { width: 200, continued: true });
//             doc.text(`₹ ${order.orderTotal}`, { width: 100, continued: true });
//             doc.text(order.quantitySold, { width: 100, continued: true });
//             doc.text(`₹ ${order.totalRevenue}`, { width: 100 });
//             doc.moveDown();
//         });

//         // Summary
//         doc.moveDown();
//         doc.fontSize(12).text(`Total Orders: ${totalOrders}`);
//         doc.text(`Total Order Amount: ₹ ${totalOrderAmount}`);
//         doc.text(`Total Profit: ₹ ${totalProfit}`);

//         doc.end();

//         // Send the file as a response
//         doc.pipe(fs.createWriteStream(filePath)).on('finish', () => {
//             res.download(filePath, 'sales-report.pdf', (err) => {
//                 if (err) {
//                     console.log(err);
//                     res.status(500).send('Could not download the report.');
//                 }
//                 // Delete the file after sending it
//                 fs.unlink(filePath, (err) => {
//                     if (err) console.log(err);
//                 });
//             });
//         });

//     } catch (error) {
//         console.log(error.message);
//         res.status(500).send('Internal Server Error');
//     }
// };

const downloadSalesReport = (req, res) => {
    try {
        const { dateRange, totalOrders, totalOrderAmount, totalProfit, orderData, dateToShow } = req.body;

        // Ensure the reports directory exists
        const reportsDir = path.join(__dirname, '..', 'public', 'reports');
        if (!fs.existsSync(reportsDir)) {
            fs.mkdirSync(reportsDir, { recursive: true });
        }

        // Create a new PDF document
        const doc = new PDFDocument({ margin: 30 });
        const filePath = path.join(reportsDir, 'sales-report.pdf');

        // Define a stream to write the PDF to the file system
        const writeStream = fs.createWriteStream(filePath);
        doc.pipe(writeStream);

        // Add company logo
        const logoPath = path.join(__dirname, '..', 'public', 'images', 'logo.png');
        if (fs.existsSync(logoPath)) {
            doc.image(logoPath, doc.page.width / 2 - 50, 15, { width: 100 }).moveDown();
        }

        // Add a title with styling
        doc.fontSize(24)
            .font('Helvetica-Bold')
            .fillColor('#003366')
            .text('Sales Report', { align: 'center' });
        doc.moveDown(1.5);

        // Draw a horizontal line
        doc.moveTo(doc.page.margins.left, doc.y)
            .lineTo(doc.page.width - doc.page.margins.right, doc.y)
            .strokeColor('#cccccc')
            .stroke();
        doc.moveDown(1.5);

        // subtitle date 
        doc.fontSize(12)
            .font('Helvetica-Oblique')
            .fillColor('#666666')
            .text(`Date Range: ${dateToShow}`, { align: 'center' });
        doc.moveDown(1.5);

        // Table headers with background color and text color
        const tableHeaders = [
            { label: 'Date', width: 80 },
            { label: 'User', width: 200 },
            { label: 'Order Total', width: 100 },
            { label: 'Quantity Sold', width: 100 },
            { label: 'Total Revenue', width: 100 }
        ];

        doc.fontSize(10)
            .font('Helvetica-Bold')
            .fillColor('#ffffff')
            .rect(doc.page.margins.left, doc.y, doc.page.width - doc.page.margins.left - doc.page.margins.right, 20)
            .fill('#000000')
            .stroke();

        let x = doc.page.margins.left;
        tableHeaders.forEach(header => {
            doc.text(header.label, x, doc.y , { width: header.width, align: 'center' });
            x += header.width;
        });
        doc.moveDown(1.5);

        // Table rows with alternating row colors
        orderData.forEach((order, index) => {
            const fillColor = index % 2 === 0 ? '#f9f9f9' : '#e6f7ff';
            doc.rect(doc.page.margins.left, doc.y, doc.page.width - doc.page.margins.left - doc.page.margins.right, 20)
                .fill(fillColor)
                .stroke();

            doc.fontSize(10)
                .font('Helvetica')
                .fillColor('#333333');

            x = doc.page.margins.left;
            doc.text(order.date, x, doc.y , { width: 80, align: 'center' });
            x += 80;
            doc.text(order.user, x, doc.y , { width: 200, align: 'center' });
            x += 200;
            doc.text(`₹ ${order.orderTotal}`, x, doc.y , { width: 100, align: 'center' });
            x += 100;
            doc.text(order.quantitySold, x, doc.y , { width: 100, align: 'center' });
            x += 100;
            doc.text(`₹ ${order.totalRevenue}`, x, doc.y , { width: 100, align: 'center' });

        });

        // Draw another horizontal line
        doc.moveTo(doc.page.margins.left, doc.y)
            .lineTo(doc.page.width - doc.page.margins.right, doc.y)
            .strokeColor('#cccccc')
            .stroke();
        doc.moveDown(1.5);

        // Summary section with styling
        doc.fontSize(14)
            .font('Helvetica-Bold')
            .fillColor('#003366')
            .text('Summary', { align: 'center' });
        doc.moveDown(1);

        doc.fontSize(9)
            .font('Helvetica')
            .fillColor('#555555')
            .text(`Total Orders: ${totalOrders}`, { align: 'left' })
            .moveDown(0.5)
            .text(`Total Order Amount: ₹ ${totalOrderAmount}`, { align: 'left' })
            .moveDown(0.5)
            .text(`Total Profit: ₹ ${totalProfit}`, { align: 'left' });

        // Finalize the PDF and end the stream
        doc.end();

        // Send the file as a response once writing is finished
        writeStream.on('finish', () => {
            res.download(filePath, 'sales-report.pdf', (err) => {
                if (err) {
                    console.log(err);
                    res.status(500).send('Could not download the report.');
                }
                // Delete the file after sending it
                fs.unlink(filePath, (err) => {
                    if (err) console.log(err);
                });
            });
        });

    } catch (error) {
        console.log(error.message);
        res.status(500).send('Internal Server Error');
    }
};




// To show the report to admin as a chart 

const adminDataChart = async (req, res) => {
    try {
        const filter = req.query.filter;

        let data;

        switch (filter) {
            case 'daily':
                data = await getDailyData();
                break;
            case 'weekly':
                data = await getWeeklyData();
                break;
            case 'monthly':
                data = await getMonthlyData();
                break;
            case 'yearly':
                data = await getYearlyData();
                break;
            default:
                // Default logic if filter is not provided or unknown
                data = { labels: [], data: [] };
                break;
        }

        res.json(data);

    } catch (error) {
        console.log(error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    };
};

async function getDailyData() {
    const today = new Date();
    const startDate = startOfDay(subDays(today, 6)); // Start from 6 days ago
    const endDate = endOfDay(today);

    const orderData = await Order.find({
        order_status: 'Delivered',
        created_at: {
            $gte: startDate,
            $lte: endDate
        }
    });

    // Get the current day of the week
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    // Generate labels array for the past 7 days
    const labels = Array.from({ length: 7 }, (_, index) => {
        const date = subDays(today, 6 - index); // Get the date for each of the past 7 days
        return format(date, 'EEEE'); // Format the date to get the day of the week
    });

    const data = labels.map((day, index) => {
        const date = startOfDay(subDays(today, 6 - index)); // Get the start of the day for each of the past 7 days
        const filteredOrders = orderData.filter(order => {
            const orderDay = startOfDay(order.created_at);
            return isSameDay(orderDay, date);
        });
        return filteredOrders.length;
    });

    return { labels, data };
};


async function getWeeklyData() {
    const today = new Date();
    const startDate = startOfWeek(subWeeks(today, 3)); // Start from the beginning of the first week in the range
    const endDate = endOfDay(today); // End with today

    const orderData = await Order.find({
        order_status: 'Delivered',
        created_at: {
            $gte: startDate,
            $lte: endDate
        }
    });

    const labels = Array.from({ length: 4 }, (_, index) => {
        const startOfWeekDate = startOfWeek(subWeeks(today, 3 - index)); // Calculate the start of each week
        const endOfWeekDate = endOfWeek(startOfWeekDate); // Calculate the end of each week
        return `${format(startOfWeekDate, 'MMM d')} - ${format(endOfWeekDate, 'MMM d')}`; // Format the date range
    });

    const data = labels.map((weekLabel, index) => {
        const startOfWeekDate = startOfWeek(subWeeks(today, 3 - index)); // Calculate the start of each week
        const endOfWeekDate = endOfWeek(startOfWeekDate); // Calculate the end of each week
        const filteredOrders = orderData.filter(order => {
            const orderDate = startOfDay(order.created_at);
            return isWithinInterval(orderDate, { start: startOfWeekDate, end: endOfWeekDate });
        });
        return filteredOrders.length;
    });

    return { labels, data };
};

async function getMonthlyData() {
    const today = new Date();
    const startDate = startOfMonth(today);
    const endDate = endOfDay(today);

    const orderData = await Order.find({
        order_status: 'Delivered',
        created_at: {
            $gte: startDate,
            $lte: endDate
        }
    });

    const labels = Array.from({ length: 12 }, (_, index) => {
        const month = startOfMonth(subMonths(today, index));
        return format(month, 'MMMM');
    }).reverse();
    const data = labels.map(month => {
        const filteredOrders = orderData.filter(order => {
            const orderMonth = startOfMonth(order.created_at);
            return format(orderMonth, 'MMMM') === month;
        });
        return filteredOrders.length;
    });

    return { labels, data };
};

async function getYearlyData() {
    const today = new Date();
    const currentYear = today.getFullYear();
    const startDate = startOfYear(subYears(today, 4)); // Start date 4 years ago to include 5 years of data
    const endDate = endOfDay(today);

    // Retrieve orders from the past 5 years
    const orderData = await Order.find({
        order_status: 'Delivered',
        created_at: {
            $gte: startDate,
            $lte: endDate
        }
    });

    // Generate labels for the past 5 years, starting from 4 years ago to the current year
    const labels = Array.from({ length: 5 }, (_, index) => String(currentYear - 4 + index));

    const data = labels.map(year => {
        const filteredOrders = orderData.filter(order => {
            const orderYear = getYear(order.created_at); // Get the year of the order date
            return String(orderYear) === year;
        });
        return filteredOrders.length;
    });

    return { labels, data };
};




module.exports = {
    loadStatistics,
    filterReports,
    downloadSalesReport,


    adminDataChart
};