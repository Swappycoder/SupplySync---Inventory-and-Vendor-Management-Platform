# SupplySync---Inventory-and-Vendor-Management-Platform

# Bussiness Model:
1. B2B/Customers place order for products.
2. Vendors list products and mage Inventory.
3. Admin manages users, vendors, approvals, disputes.
4. Driver handles delivery.
5. System tracks stocks, order, payments, deivery status.

# Flow: 
Customer --> Place Order --> Vendor Confirms --> Inventory Updated --> Driver Assigned --> Delivery --> Payment --> Analytics.

# User Roles:
## Admin:
1. Approves Vendors.
2. Manages platform users.
3. Monitors all orders and revenue.
4. Controls pricing rules and commisions.
5. View system wide analyics.

## Vendor:
1. Manages products and stocks.
2. Accepts/Rejects orders.
3. Updates Inventory.
4. Tracks revenue and fulfilment rate.

## Customer(Client):
1. Browse vendors and products.
2. Place Bulk orders.
3. Tracks Delivery.
4. View invoice and order history.

## Driver/Logistics Partner:
1. Accepts Delivery tasks.
2. Updates Delivery Status.
3. Track routes and delivery history.

## Warehouse Manager:
1. Manage warehouse stock.
2. Update packing and dispatching.

# Functional Requirements:
1. Login/ Register
2. Role Based Access

## User Management:
1. Create/update users
2. Vendors onboarding and approval.
3. Assign roles and permissions.
4. CRUD operations on products
5. Stock in/out
6. Low stock alerts
7. Batch and expiry alerts.
8. Place orders
9. order approval workflow
10. order status [pending -> accepted -> packed -> dispatched -> Delivered
11. order cancellation and return worflow.
12. Vendor profile and rating
13. Vendor wise product listings
14. performance tracking of vendors
15. delivery tracking
16. proof of delivery (OTP).
17. Invoice generation.
18. Payment tracking
19. Refund handling
20. Commision calculation
21. Sales analytics
22. Customer behaviour

# Non - Functional Requirements:


# High level Architecture

Frontend (Reactjs)
Backend (Springboot/node.js)
DataBase(MySQL)
Auth Service
Order Service
Inventory Service
Analytics Service

# Core Modules
## Authentication and Authorization:
JWT tokens and Roles based access middleware.

## User Management
Role Assignment and Vendor approval.

## order management
LifeCycle of order and Status transition

## Inventory Module
Real-time stock sync and Threshold Alerts.

## Vendor Module
Fulfilment rate and vendor performance.

# Analytics for each dashboard:
## Admin:
1. Purchase overview [Monthly]
2. Sales Overview
3. Platform Commission
4. Active Vendors
5. Fail Deliveries %
6. Inventory Summary
7. Order Summary
8. Top and Low Quality Stock
9. Top 10 Vendors by sales
10. Active Vendors

## Vendor:
1. Dail/Monthly Sales
2. Order Acceptance Rate
3. Return Rate
4. Pending vs completed order.
5. Product-wise sales

## Customer/Client:
1. Total order Placed
2. Monthly Spending
3. Order Success vs Order Failed
4. Order Frequency
5. Spend By Catagory
6. Recommended Vendors
7. Reorder suggestions

## Logistics:
1. Delivery completed
2. on time delivery%
3. Daily delivery count
4. Deliver success ratio
5. Performance ranking

# Basic ER

User(user_id, name, role)
Vendor(vendor_id, name, rating)
Product(Product_id, vendor_id, stock)
OrderItem(order_id, product_id, qty)
Delivery(delivery_id, driver_id, status)
Payment(payemnt_id, order_id, amt)


