const User = require('../models/userModel');
const Product = require('../models/productModel');
const Category = require('../models/categoryModel');
const Address = require('../models/addressModel');
const Wishlist = require('../models/wishlistModel');
const Cart = require('../models/cartModel');
const Order = require('../models/orderModel');
const Coupon = require('../models/couponModel');


const { parseISO, format, startOfToday, startOfYesterday, subWeeks, subMonths, subYears, startOfWeek, startOfMonth, startOfYear, endOfDay } = require('date-fns');

const puppeteer = require('puppeteer');
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
            totalProfit
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

        const { dateRange, startDate, endDate } = req.body;

        let startDateFilter, endDateFilter;
        const today = new Date();

        switch (dateRange) {
            case 'today':
                startDateFilter = startOfToday();
                endDateFilter = endOfDay(today);
                break;
            case 'yesterday':
                startDateFilter = startOfYesterday();
                endDateFilter = startOfToday();
                break;
            case 'lastWeek':
                startDateFilter = startOfWeek(subWeeks(today, 1));
                endDateFilter = endOfDay(today);
                break;
            case 'lastMonth':
                startDateFilter = startOfMonth(subMonths(today, 1));
                endDateFilter = endOfDay(today);
                break;
            case 'lastYear':
                startDateFilter = startOfYear(subYears(today, 1));
                endDateFilter = endOfDay(today);
                break;
            case 'custom':
                if (startDate && endDate) {
                    startDateFilter = parseISO(startDate);
                    endDateFilter = parseISO(endDate);
                }
                break;
            default:
                startDateFilter = startOfToday();
                endDateFilter = endOfDay(today);
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

            for (let j = 0; j < orderData[i].products.length; j++) {
                totalQuantity += orderData[i].products[j].quantity;
            }

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

        res.render('salesReport', { activeStatsMessage: 'active', orderData: ordersToFrontend, dates: dateArray, quantityArray, dateRange, totalOrders: ordersToFrontend.length, totalOrderAmount, totalProfit });
        
    } catch (error) {
        console.log(error.message);
    };
};


module.exports = {
    loadStatistics,
    filterReports,

};