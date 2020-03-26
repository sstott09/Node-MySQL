// Then create a Node application called Bamazon.js. Running this application will:

// First Display All of the Items available for sale. This initial display, should include the ids, names, and prices of products for sale

// Users should then be prompted with two messages. The first message should ask them what product they would like to buy. The second message should ask them how many of the product they would like to buy.

// Once the customer has placed the order: Your application should...

// Check if your store has enough quantity of the product to meet the customer's request. If not, you should respond to the user by saying: "Insufficient quantity" and prevent the order from going through.

// If your store DOES have enough of the product to meet the customer's request, you should fulfill their order. This means that you should show them the total cost of their puchase. Then update the SQL database to reflect the remaining quantity.

// npm's
var mysql = require('mysql');
var inquirer = require('inquirer');

// mySQL connection
var connection = mysql.createConnection({
    host: "localhost",
    port: "3306",
    user: "root", // Your username
    password: "password", // Your password
    database: "bamazon"
});

// display bamazon/products table
// ItemID INT NOT NULL AUTO_INCREMENT,
// ProductName VARCHAR(100) NULL,
// DepartmentName VARCHAR(100) NULL,
// Price DECIMAL(10,2) NULL,
// StockQuantity INT NOT NULL,
connection.query('SELECT * FROM products', function (err, res) {
    if (err) 
        throw err;
    
    // console.log(res);
    console.log("Item \t Product \t Department \t Price \t Stock");
    console.log("----------------------------------------------------------------------");
    for (var i = 0; i < res.length; i++) {
        console.log(res[i].ItemID + "   " + res[i].ProductName + "   \t   " + res[i].DepartmentName + "   \t   " + res[i].Price + "   \t   " + res[i].StockQuantity);
    }
    console.log("----------------------------------------------------------------------");
    // connection.end();

    // define prompt function
    inquirer.prompt([{
            name: "product",
            message: "What Product would you like to buy? [Quit with Q]"
            // }, {
            //     name: "qty",
            //     message: "How many would you like to buy?"
        }]).then(function (ansProd) {
        // console.log(answers.product);
        // console.log(answers.qty);
        // quit, else run purchase
        if (ansProd.product.toUpperCase() == "Q") {
            connection.end();
        } else {
            inquirer.prompt([{
                    name: "qty",
                    message: "How many would you like to buy?"
                }]).then(function (ansQty) {
                console.log(ansProd.product);
                // console.log(ansQty.qty);
                connection.query('SELECT * FROM products WHERE ?', {
                    ProductName: ansProd.product
                }, function (err, res) {
                    if (err) 
                        throw err;
                    

                    // if StockQuantity > answers.qty
                    // console.log("Qty: " + res[0].StockQuantity);
                    if (res[0].StockQuantity > ansQty.qty) { // place order: calculate total cost of order
                        var cost = res[0].Price * ansQty.qty
                        console.log("-----------------------------------");
                        console.log("Your order has been placed! \nThe total cost is $" + cost.toFixed(2) + "\nThank you!")
                        // update StockQuantity amount
                        var newQty = res[0].StockQuantity - ansQty.qty
                        connection.query("UPDATE products SET ? WHERE ?", [
                            {
                                StockQuantity: newQty
                            }, {
                                ProductName: ansProd.product
                            }
                        ], function (err, res) {});
                        // else "Insufficient quantity.  Please request a quantity less than " + StockQuantity
                    } else {
                        console.log("-----------------------------------");
                        console.log("Sorry, we do not have enough in stock. \nWe only have " + res[0].StockQuantity + " units of " + ansProd.product + ". \nPlease retry your order. \nThank you!")
                    }

                })


            })
        }
    })

});
