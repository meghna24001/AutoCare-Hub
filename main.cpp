#include <iostream>
#include <fstream>
#include <vector>
#include <string>
#include <iomanip>
#include <limits>
#include <algorithm>

using namespace std;

// ======================================================
//CLASSES
// ======================================================

// CUSTOMER CLASS
class Customer{
private:
    int customerID;
    string customerName;
    string address;
    string mobileNumber;
    string emailAddress;
public:
    // Default constructor
    Customer(){
        customerID = 0;
        customerName = "";
        address = "";
        mobileNumber = "";
        emailAddress = "";
    }
    // Parameterized constructor
    Customer(int id, string name, string addr, string mobile, string email){
        customerID = id;
        customerName = name;
        address = addr;
        mobileNumber = mobile;
        emailAddress = email;
    }
    // Getters
    int getCustomerID() const{
        return customerID;
    }
    string getCustomerName() const{
        return customerName;
    }
    string getAddress() const{
        return address;
    }
    string getMobileNumber() const{
        return mobileNumber;
    }
    string getEmailAddress() const{
        return emailAddress;
    }
    // Setters
    void setCustomerID(int id){
        customerID = id;
    }
    void setCustomerName(string name){
        customerName = name;
    }
    void setAddress(string addr){
        address = addr;
    }
    void setMobileNumber(string mobile){
        mobileNumber = mobile;
    }
    void setEmailAddress(string email){
        emailAddress = email;
    }
    // Display customer information
    void displayCustomer() const{
        cout << "\n----------------------------------------\n";
        cout << "Customer ID     : " << customerID << endl;
        cout << "Customer Name   : " << customerName << endl;
        cout << "Address         : " << address << endl;
        cout << "Mobile Number   : " << mobileNumber << endl;
        cout << "Email Address   : " << emailAddress << endl;
        cout << "----------------------------------------\n";
    }
};

// VEHICLE CLASS
class Vehicle{
private:
    int vehicleID;
    int customerID;
    string registrationNumber;
    string model;
    string manufacturer;
    int yearOfManufacture;
    string fuelType;
public:
    // Default constructor
    Vehicle(){
        vehicleID = 0;
        customerID = 0;
        registrationNumber = "";
        model = "";
        manufacturer = "";
        yearOfManufacture = 0;
        fuelType = "";
    }
    // Parameterized constructor
    Vehicle(int vID, int cID, string regNo, string mdl, string mfr, int year, string fuel){
        vehicleID = vID;
        customerID = cID;
        registrationNumber = regNo;
        model = mdl;
        manufacturer = mfr;
        yearOfManufacture = year;
        fuelType = fuel;
    }
    // Getters
    int getVehicleID() const{
        return vehicleID;
    }
    int getCustomerID() const{
        return customerID;
    }
    string getRegistrationNumber() const{
        return registrationNumber;
    }
    string getModel() const{
        return model;
    }
    string getManufacturer() const{
        return manufacturer;
    }
    int getYearOfManufacture() const{
        return yearOfManufacture;
    }
    string getFuelType() const{
        return fuelType;
    }
    // Setters
    void setVehicleID(int id){
        vehicleID = id;
    }
    void setCustomerID(int id){
        customerID = id;
    }
    void setRegistrationNumber(string regNo){
        registrationNumber = regNo;
    }
    void setModel(string mdl){
        model = mdl;
    }
    void setManufacturer(string mfr){
        manufacturer = mfr;
    }
    void setYearOfManufacture(int year){
        yearOfManufacture = year;
    }
    void setFuelType(string fuel){
        fuelType = fuel;
    }
    // Display vehicle information
    void displayVehicle() const{
        cout << "\n----------------------------------------\n";
        cout << "Vehicle ID          : " << vehicleID << endl;
        cout << "Customer ID         : " << customerID << endl;
        cout << "Registration Number : " << registrationNumber << endl;
        cout << "Model               : " << model << endl;
        cout << "Manufacturer        : " << manufacturer << endl;
        cout << "Year of Manufacture : " << yearOfManufacture << endl;
        cout << "Fuel Type           : " << fuelType << endl;
        cout << "----------------------------------------\n";
    }
};

// SERVICE CLASS
class Service{
private:
    int serviceID;
    int customerID;
    int vehicleID;
    int mechanicID;
    string serviceDate;
    string serviceType;
    double labourCharges;
    double sparePartsCost;
    double totalBillAmount;
public:
    // Default Constructor
    Service(){
        serviceID = 0;
        customerID = 0;
        vehicleID = 0;
        mechanicID = 0;
        serviceDate = "";
        serviceType = "";
        labourCharges = 0.0;
        sparePartsCost = 0.0;
        totalBillAmount = 0.0;
    }
    // Parameterized Constructor
    Service(int sID, int cID, int vID, int mID, string date, string type,
            double labour, double parts){
        serviceID = sID;
        customerID = cID;
        vehicleID = vID;
        mechanicID = mID;
        serviceDate = date;
        serviceType = type;
        labourCharges = labour;
        sparePartsCost = parts;
        calculateTotalBill();
    }
    // Calculate Total Bill
    void calculateTotalBill(){
        totalBillAmount = labourCharges + sparePartsCost;
    }
    // Getters
    int getServiceID() const{
        return serviceID;
    }
    int getCustomerID() const{
        return customerID;
    }
    int getVehicleID() const{
        return vehicleID;
    }
    int getMechanicID() const{
        return mechanicID;
    }
    string getServiceDate() const{
        return serviceDate;
    }
    string getServiceType() const{
        return serviceType;
    }
    double getLabourCharges() const{
        return labourCharges;
    }
    double getSparePartsCost() const{
        return sparePartsCost;
    }
    double getTotalBillAmount() const{
        return totalBillAmount;
    }
    // Setters
    void setServiceID(int id){
        serviceID = id;
    }
    void setCustomerID(int id){
        customerID = id;
    }
    void setVehicleID(int id){
        vehicleID = id;
    }
    void setMechanicID(int id){
        mechanicID = id;
    }
    void setServiceDate(string date){
        serviceDate = date;
    }
    void setServiceType(string type){
        serviceType = type;
    }
    void setLabourCharges(double labour){
        labourCharges = labour;
        calculateTotalBill();
    }
    void setSparePartsCost(double parts){
        sparePartsCost = parts;
        calculateTotalBill();
    }
    // Display Service Information
    void displayService() const{
        cout << "\n========================================\n";
        cout << "          SERVICE INFORMATION\n";
        cout << "========================================\n";

        cout << "Service ID          : " << serviceID << endl;
        cout << "Customer ID         : " << customerID << endl;
        cout << "Vehicle ID          : " << vehicleID << endl;
        cout << "Mechanic ID         : " << mechanicID << endl;
        cout << "Service Date        : " << serviceDate << endl;
        cout << "Service Type        : " << serviceType << endl;
        cout << fixed << setprecision(2);
        cout << "Labour Charges      : Rs. " << labourCharges << endl;
        cout << "Spare Parts Cost    : Rs. " << sparePartsCost << endl;
        cout << "Total Bill Amount   : Rs. " << totalBillAmount << endl;

        cout << "========================================\n";
    }
};


// ======================================================
// CLEAR INVALID INPUT
// ======================================================
void clearInput(){
    cin.clear();
    cin.ignore(
        numeric_limits<streamsize>::max(),
        '\n'
    );
}


// ======================================================
// FILE HANDLING FUNCTIONS
// ======================================================

// Save Customers
void saveCustomers(const vector<Customer>& customers){
    ofstream file("customers.dat");
    if (!file){
        cout << "Error: Unable to open customers.dat for writing.\n";
        return;
    }
    for (const Customer& c : customers){
        file << c.getCustomerID() << "|"
             << c.getCustomerName() << "|"
             << c.getAddress() << "|"
             << c.getMobileNumber() << "|"
             << c.getEmailAddress() << "\n";
    }
    file.close();
}

// Load Customers
void loadCustomers(vector<Customer>& customers){
    ifstream file("customers.dat");
    if (!file){
        return;
    }
    string line;
    while (getline(file, line)){
        if (line.empty())
            continue;
        size_t pos1 = line.find('|');
        size_t pos2 = line.find('|', pos1 + 1);
        size_t pos3 = line.find('|', pos2 + 1);
        size_t pos4 = line.find('|', pos3 + 1);
        if (pos1 == string::npos ||
            pos2 == string::npos ||
            pos3 == string::npos ||
            pos4 == string::npos){
            continue;
        }
        int id = stoi(line.substr(0, pos1));
        string name = line.substr(pos1 + 1, pos2 - pos1 - 1);
        string address = line.substr(pos2 + 1, pos3 - pos2 - 1);
        string mobile = line.substr(pos3 + 1, pos4 - pos3 - 1);
        string email = line.substr(pos4 + 1);
        Customer c(id, name, address, mobile, email);
        customers.push_back(c);
    }
    file.close();
}

// Save Vehicles
void saveVehicles(const vector<Vehicle>& vehicles){
    ofstream file("vehicles.dat");
    if (!file){
        cout << "Error: Unable to open vehicles.dat for writing.\n";
        return;
    }
    for (const Vehicle& v : vehicles){
        file << v.getVehicleID() << "|"
             << v.getCustomerID() << "|"
             << v.getRegistrationNumber() << "|"
             << v.getModel() << "|"
             << v.getManufacturer() << "|"
             << v.getYearOfManufacture() << "|"
             << v.getFuelType() << "\n";
    }
    file.close();
}

// Load Vehicles
void loadVehicles(vector<Vehicle>& vehicles){
    ifstream file("vehicles.dat");
    if (!file){
        return;
    }
    string line;
    while (getline(file, line)){
        if (line.empty())
            continue;
        size_t pos1 = line.find('|');
        size_t pos2 = line.find('|', pos1 + 1);
        size_t pos3 = line.find('|', pos2 + 1);
        size_t pos4 = line.find('|', pos3 + 1);
        size_t pos5 = line.find('|', pos4 + 1);
        size_t pos6 = line.find('|', pos5 + 1);
        if (pos1 == string::npos ||
            pos2 == string::npos ||
            pos3 == string::npos ||
            pos4 == string::npos ||
            pos5 == string::npos ||
            pos6 == string::npos){
            continue;
        }
        int vehicleID = stoi(line.substr(0, pos1));
        int customerID = stoi(line.substr(pos1 + 1, pos2 - pos1 - 1));
        string registrationNumber = line.substr(pos2 + 1, pos3 - pos2 - 1);
        string model = line.substr(pos3 + 1, pos4 - pos3 - 1);
        string manufacturer = line.substr(pos4 + 1, pos5 - pos4 - 1);
        int year = stoi(line.substr(pos5 + 1, pos6 - pos5 - 1));
        string fuelType = line.substr(pos6 + 1);
        Vehicle v(
            vehicleID,
            customerID,
            registrationNumber,
            model,
            manufacturer,
            year,
            fuelType
        );
        vehicles.push_back(v);
    }
    file.close();
}

// Save Services
void saveServices(const vector<Service>& services){
    ofstream file("services.dat");
    if (!file){
        cout << "Error: Unable to open services.dat for writing.\n";
        return;
    }
    for (const Service& s : services){
        file << s.getServiceID() << "|"
             << s.getCustomerID() << "|"
             << s.getVehicleID() << "|"
             << s.getMechanicID() << "|"
             << s.getServiceDate() << "|"
             << s.getServiceType() << "|"
             << s.getLabourCharges() << "|"
             << s.getSparePartsCost() << "|"
             << s.getTotalBillAmount() << "\n";
    }
    file.close();
}

// Load Services
void loadServices(vector<Service>& services){
    ifstream file("services.dat");
    if (!file){
        return;
    }
    string line;
    while (getline(file, line)){
        if (line.empty())
            continue;
        size_t pos1 = line.find('|');
        size_t pos2 = line.find('|', pos1 + 1);
        size_t pos3 = line.find('|', pos2 + 1);
        size_t pos4 = line.find('|', pos3 + 1);
        size_t pos5 = line.find('|', pos4 + 1);
        size_t pos6 = line.find('|', pos5 + 1);
        size_t pos7 = line.find('|', pos6 + 1);
        size_t pos8 = line.find('|', pos7 + 1);
        if (pos1 == string::npos ||
            pos2 == string::npos ||
            pos3 == string::npos ||
            pos4 == string::npos ||
            pos5 == string::npos ||
            pos6 == string::npos ||
            pos7 == string::npos ||
            pos8 == string::npos){
            continue;
        }
        int serviceID = stoi(line.substr(0, pos1));
        int customerID = stoi(line.substr(pos1 + 1, pos2 - pos1 - 1));
        int vehicleID = stoi(line.substr(pos2 + 1, pos3 - pos2 - 1));
        int mechanicID = stoi(line.substr(pos3 + 1, pos4 - pos3 - 1));
        string serviceDate = line.substr(pos4 + 1, pos5 - pos4 - 1);
        string serviceType = line.substr(pos5 + 1, pos6 - pos5 - 1);
        double labourCharges = stod(line.substr(pos6 + 1, pos7 - pos6 - 1));
        double sparePartsCost = stod(line.substr(pos7 + 1, pos8 - pos7 - 1));
        Service s(
            serviceID,
            customerID,
            vehicleID,
            mechanicID,
            serviceDate,
            serviceType,
            labourCharges,
            sparePartsCost
        );
        services.push_back(s);
    }
    file.close();
}


// ======================================================
// INPUT VALIDATION FUNCTIONS
// ======================================================

// Validate Mobile Number
bool isValidMobileNumber(const string& mobile){
    if (mobile.length() != 10)
        return false;
    for (char ch : mobile){
        if (!isdigit(ch))
            return false;
    }
    return true;
}

// Validate Positive / Zero Amount
bool isValidAmount(double amount){
    return amount >= 0;
}

// Check Whether Customer ID Exists
bool customerExists(const vector<Customer>& customers, int customerID){
    for (const Customer& c : customers){
        if (c.getCustomerID() == customerID)
            return true;
    }
    return false;
}

// Check Whether Vehicle ID Exists
bool vehicleExists(const vector<Vehicle>& vehicles, int vehicleID){
    for (const Vehicle& v : vehicles){
        if (v.getVehicleID() == vehicleID)
            return true;
    }
    return false;
}

// Check Whether Service ID Exists
bool serviceExists(const vector<Service>& services, int serviceID){
    for (const Service& s : services){
        if (s.getServiceID() == serviceID)
            return true;
    }
    return false;
}

// Check Unique Vehicle Registration Number
bool registrationExists(const vector<Vehicle>& vehicles, const string& registrationNumber){
    for (const Vehicle& v : vehicles){
        if (v.getRegistrationNumber() == registrationNumber)
            return true;
    }
    return false;
}

// Find Customer by ID
Customer* findCustomer(vector<Customer>& customers, int customerID){
    for (Customer& c : customers){
        if (c.getCustomerID() == customerID)
            return &c;
    }
    return nullptr;
}

const Customer* findCustomer(const vector<Customer>& customers,int customerID){
    for (const Customer& c : customers){
        if (c.getCustomerID() == customerID)
            return &c;
    }
    return nullptr;
}

// Find Vehicle by ID
const Vehicle* findVehicle(const vector<Vehicle>& vehicles, int vehicleID){
    for (const Vehicle& v : vehicles){
        if (v.getVehicleID() == vehicleID)
            return &v;
    }
    return nullptr;
}

// Find Service by ID
Service* findService(vector<Service>& services, int serviceID){
    for (Service& s : services){
        if (s.getServiceID() == serviceID)
            return &s;
    }
    return nullptr;
}

// REGISTER NEW CUSTOMER
void registerCustomer(vector<Customer>& customers){
    int customerID;
    string name;
    string address;
    string mobile;
    string email;
    cout << "\n========================================\n";
    cout << "         REGISTER NEW CUSTOMER\n";
    cout << "========================================\n";
    // Customer ID
    cout << "Enter Customer ID: ";
    cin >> customerID;
    if (customerExists(customers, customerID)){
        cout << "Error: Customer ID already exists.\n";
        return;
    }
    cin.ignore(numeric_limits<streamsize>::max(), '\n');
    // Customer Name
    cout << "Enter Customer Name: ";
    getline(cin, name);
    // Address
    cout << "Enter Address: ";
    getline(cin, address);
    // Mobile Number
    cout << "Enter Mobile Number: ";
    getline(cin, mobile);
    if (!isValidMobileNumber(mobile)){
        cout << "Error: Mobile number must contain exactly 10 digits.\n";
        return;
    }
    // Email
    cout << "Enter Email Address: ";
    getline(cin, email);
    Customer newCustomer(
        customerID,
        name,
        address,
        mobile,
        email
    );
    customers.push_back(newCustomer);
    // Save customer immediately
    saveCustomers(customers);
    cout << "\nCustomer registered successfully!\n";
}

// REGISTER NEW VEHICLE
void registerVehicle(vector<Customer>& customers, vector<Vehicle>& vehicles){
    int vehicleID;
    int customerID;
    string registrationNumber;
    string model;
    string manufacturer;
    int year;
    string fuelType;
    cout << "\n========================================\n";
    cout << "          REGISTER NEW VEHICLE\n";
    cout << "========================================\n";
    // Vehicle ID
    cout << "Enter Vehicle ID: ";
    cin >> vehicleID;
    if (vehicleExists(vehicles, vehicleID)){
        cout << "Error: Vehicle ID already exists.\n";
        return;
    }
    // Customer ID
    cout << "Enter Customer ID (Owner): ";
    cin >> customerID;
    if (!customerExists(customers, customerID)){
        cout << "Error: Customer does not exist.\n";
        cout << "Please register the customer first.\n";
        return;
    }
    cin.ignore(numeric_limits<streamsize>::max(), '\n');
    // Registration Number
    cout << "Enter Registration Number: ";
    getline(cin, registrationNumber);
    if (registrationExists(vehicles, registrationNumber)){
        cout << "Error: Registration number already exists.\n";
        return;
    }
    // Model
    cout << "Enter Model: ";
    getline(cin, model);
    // Manufacturer
    cout << "Enter Manufacturer: ";
    getline(cin, manufacturer);
    // Year
    cout << "Enter Year of Manufacture: ";
    cin >> year;
    // Fuel Type
    cin.ignore(numeric_limits<streamsize>::max(), '\n');
    cout << "Enter Fuel Type: ";
    getline(cin, fuelType);
    Vehicle newVehicle(
        vehicleID,
        customerID,
        registrationNumber,
        model,
        manufacturer,
        year,
        fuelType
    );
    vehicles.push_back(newVehicle);
    // Save vehicle immediately
    saveVehicles(vehicles);
    cout << "\nVehicle registered successfully!\n";
}

// RECORD VEHICLE SERVICE
void recordService(const vector<Customer>& customers, const vector<Vehicle>& vehicles,
    vector<Service>& services){
    int serviceID;
    int customerID;
    int vehicleID;
    int mechanicID;
    string serviceDate;
    string serviceType;
    double labourCharges;
    double sparePartsCost;
    cout << "\n========================================\n";
    cout << "          RECORD VEHICLE SERVICE\n";
    cout << "========================================\n";
    // Service ID
    cout << "Enter Service ID: ";
    cin >> serviceID;
    if (serviceExists(services, serviceID)){
        cout << "Error: Service ID already exists.\n";
        return;
    }
    // Customer ID
    cout << "Enter Customer ID: ";
    cin >> customerID;
    if (!customerExists(customers, customerID)){
        cout << "Error: Customer does not exist.\n";
        cout << "Please register the customer first.\n";
        return;
    }
    // Vehicle ID
    cout << "Enter Vehicle ID: ";
    cin >> vehicleID;
    const Vehicle* vehicle = findVehicle(vehicles, vehicleID);
    if (vehicle == nullptr){
        cout << "Error: Vehicle does not exist.\n";
        cout << "Please register the vehicle first.\n";
        return;
    }
    // Make sure the vehicle belongs to the selected customer
    if (vehicle->getCustomerID() != customerID){
        cout << "Error: This vehicle does not belong to the selected customer.\n";
        return;
    }
    // Mechanic ID
    cout << "Enter Mechanic ID: ";
    cin >> mechanicID;
    cin.ignore(numeric_limits<streamsize>::max(), '\n');
    // Service Date
    cout << "Enter Service Date (DD-MM-YYYY): ";
    getline(cin, serviceDate);
    // Service Type
    cout << "Enter Service Type: ";
    getline(cin, serviceType);
    // Labour Charges
    cout << "Enter Labour Charges: ";
    cin >> labourCharges;
    if (!cin){
        cout << "Error: Invalid labour charge.\n";
        cin.clear();
        cin.ignore(numeric_limits<streamsize>::max(), '\n');
        return;
    }
    if (labourCharges < 0){
        cout << "Error: Labour charges cannot be negative.\n";
        return;
    }
    // Spare Parts Cost
    cout << "Enter Spare Parts Cost: ";
    cin >> sparePartsCost;
    if (!cin){
        cout << "Error: Invalid spare parts cost.\n";
        cin.clear();
        cin.ignore(numeric_limits<streamsize>::max(), '\n');
        return;
    }
    if (sparePartsCost < 0){
        cout << "Error: Spare parts cost cannot be negative.\n";
        return;
    }
    // Create Service Object
    Service newService(
        serviceID,
        customerID,
        vehicleID,
        mechanicID,
        serviceDate,
        serviceType,
        labourCharges,
        sparePartsCost
    );
    // Add to vector
    services.push_back(newService);
    // Save service immediately
    saveServices(services);
    // Display Result
    cout << "\nService recorded successfully!\n";
    cout << "Total Bill Amount: Rs. "
         << fixed << setprecision(2)
         << newService.getTotalBillAmount()
         << endl;
}

// SEARCH VEHICLE BY REGISTRATION NUMBER
void searchVehicleByRegistration( const vector<Vehicle>& vehicles){
    string registrationNumber;
    cout << "\n========================================\n";
    cout << "             SEARCH VEHICLE\n";
    cout << "========================================\n";
    cout << "Enter Registration Number: ";
    cin.ignore(numeric_limits<streamsize>::max(), '\n');
    getline(cin, registrationNumber);
    for (const Vehicle& v : vehicles){
        if (v.getRegistrationNumber() == registrationNumber){
            v.displayVehicle();
            return;
        }
    }
    cout << "\nVehicle not found.\n";
}

// SEARCH CUSTOMER BY CUSTOMER ID
void searchCustomerByID(const vector<Customer>& customers){
    int customerID;
    cout << "\n========================================\n";
    cout << "             SEARCH CUSTOMER\n";
    cout << "========================================\n";
    cout << "Enter Customer ID: ";
    if (!(cin >> customerID)){
        cout << "Invalid Customer ID.\n";
        clearInput();
        return;
    }
    for (const Customer& c : customers){
        if (c.getCustomerID() == customerID){
            c.displayCustomer();
            return;
        }
    }
    cout << "\nCustomer not found.\n";
}

// UPDATE VEHICLE SERVICE DETAILS
void updateService(vector<Service>& services){
    int serviceID;
    cout << "\n========================================\n";
    cout << "         UPDATE SERVICE DETAILS\n";
    cout << "========================================\n";
    cout << "Enter Service ID: ";
    if (!(cin >> serviceID)){
        cout << "Invalid Service ID.\n";
        clearInput();
        return;
    }
    Service* service = findService(services, serviceID);
    if (service == nullptr){
        cout << "\nService record not found.\n";
        return;
    }
    cout << "\nCurrent Service Details:";
    service->displayService();
    cin.ignore(numeric_limits<streamsize>::max(), '\n');
    string date;
    string type;
    double labour;
    double parts;
    cout << "\nEnter New Service Date (DD-MM-YYYY): ";
    getline(cin, date);
    cout << "Enter New Service Type: ";
    getline(cin, type);
    cout << "Enter New Labour Charges: ";
    if (!(cin >> labour)){
        cout << "Invalid labour charges.\n";
        clearInput();
        return;
    }
    if (labour < 0){
        cout << "Labour charges cannot be negative.\n";
        return;
    }
    cout << "Enter New Spare Parts Cost: ";
    if (!(cin >> parts)){
        cout << "Invalid spare parts cost.\n";
        clearInput();
        return;
    }
    if (parts < 0){
        cout << "Spare parts cost cannot be negative.\n";
        return;
    }
    service->setServiceDate(date);
    service->setServiceType(type);
    service->setLabourCharges(labour);
    service->setSparePartsCost(parts);
    cout << "\nService record updated successfully!\n";
    cout << "\nUpdated Service Details:";
    service->displayService();
}

// DELETE SERVICE RECORD
void deleteService(vector<Service>& services){
    int serviceID;
    cout << "\n========================================\n";
    cout << "          DELETE SERVICE RECORD\n";
    cout << "========================================\n";
    cout << "Enter Service ID: ";
    if (!(cin >> serviceID)){
        cout << "Invalid Service ID.\n";
        clearInput();
        return;
    }
    for (auto it = services.begin(); it != services.end(); ++it){
        if (it->getServiceID() == serviceID){
            services.erase(it);
            cout << "\nService record deleted successfully!\n";
            return;
        }
    }
    cout << "\nService record not found.\n";
}

// DISPLAY ALL CUSTOMERS
void displayAllCustomers(const vector<Customer>& customers){
    cout << "\n========================================\n";
    cout << "             ALL CUSTOMERS\n";
    cout << "========================================\n";
    if (customers.empty()){
        cout << "No customer records available.\n";
        return;
    }
    for (const Customer& c : customers)
        c.displayCustomer();
}

// DISPLAY ALL VEHICLES
void displayAllVehicles(const vector<Vehicle>& vehicles){
    cout << "\n========================================\n";
    cout << "              ALL VEHICLES\n";
    cout << "========================================\n";
    if (vehicles.empty()){
        cout << "No vehicle records available.\n";
        return;
    }
    for (const Vehicle& v : vehicles)
        v.displayVehicle();
}

// CONVERT DATE TO NUMBER FOR SORTING
int dateValue(const string& date){
    if (date.length() != 10)
        return 0;
    try{
        int day = stoi(date.substr(0, 2));
        int month = stoi(date.substr(3, 2));
        int year = stoi(date.substr(6, 4));
        return year * 10000 + month * 100 + day;
    }
    catch (...){
        return 0;
    }
}


// ======================================================
// DISPLAY COMPLETE SERVICE HISTORY
// ======================================================

void displayServiceHistory(const vector<Vehicle>& vehicles, const vector<Service>& services){
    int vehicleID;
    cout << "\n========================================\n";
    cout << "        COMPLETE SERVICE HISTORY\n";
    cout << "========================================\n";
    cout << "Enter Vehicle ID: ";
    if (!(cin >> vehicleID)){
        cout << "Invalid Vehicle ID.\n";
        clearInput();
        return;
    }
    const Vehicle* vehicle = findVehicle(vehicles, vehicleID);
    if (vehicle == nullptr){
        cout << "\nVehicle not found.\n";
        return;
    }
    vector<Service> history;
    for (const Service& s : services){
        if (s.getVehicleID() == vehicleID)
            history.push_back(s);
    }
    if (history.empty()){
        cout << "\nNo service history found for this vehicle.\n";
        return;
    }
    sort(
        history.begin(),
        history.end(),
        [](const Service& a, const Service& b){
            return dateValue(a.getServiceDate())
                   <
                   dateValue(b.getServiceDate());
        }
    );

    cout << "\nVehicle Registration: "
         << vehicle->getRegistrationNumber()
         << endl;

    cout << "\nService History:\n";

    for (const Service& s : history)
    {
        s.displayService();
    }
}


// ======================================================
// GENERATE VEHICLE SERVICE BILL
// ======================================================

void generateBill(const vector<Customer>& customers, const vector<Vehicle>& vehicles, const vector<Service>& services){
    int serviceID;
    cout << "\n========================================\n";
    cout << "           VEHICLE SERVICE BILL\n";
    cout << "========================================\n";
    cout << "Enter Service ID: ";
    if (!(cin >> serviceID)){
        cout << "Invalid Service ID.\n";
        clearInput();
        return;
    }
    const Service* service = nullptr;
    for (const Service& s : services){
        if (s.getServiceID() == serviceID){
            service = &s;
            break;
        }
    }
    if (service == nullptr){
        cout << "\nService record not found.\n";
        return;
    }
    const Customer* customer = findCustomer(
        customers,
        service->getCustomerID()
    );
    const Vehicle* vehicle = findVehicle(
        vehicles,
        service->getVehicleID()
    );
    cout << "\n";
    cout << "============================================\n";
    cout << "            VEHICLE SERVICE BILL\n";
    cout << "============================================\n";
    cout << "Service ID       : "
         << service->getServiceID() << endl;
    if (customer != nullptr){
        cout << "Customer Name    : "
             << customer->getCustomerName() << endl;
        cout << "Mobile Number    : "
             << customer->getMobileNumber() << endl;
    }
    if (vehicle != nullptr){
        cout << "Registration No. : "
             << vehicle->getRegistrationNumber() << endl;
        cout << "Vehicle Model    : "
             << vehicle->getModel() << endl;
        cout << "Manufacturer     : "
             << vehicle->getManufacturer() << endl;
    }
    cout << "Service Date     : "
         << service->getServiceDate() << endl;
    cout << "Service Type     : "
         << service->getServiceType() << endl;
    cout << "--------------------------------------------\n";
    cout << fixed << setprecision(2);
    cout << "Labour Charges   : Rs. "
         << service->getLabourCharges() << endl;
    cout << "Spare Parts Cost : Rs. "
         << service->getSparePartsCost() << endl;
    cout << "--------------------------------------------\n";
    cout << "TOTAL BILL       : Rs. "
         << service->getTotalBillAmount() << endl;
    cout << "============================================\n";
}


// ======================================================
// MAIN FUNCTION
// ======================================================

int main(){
    vector<Customer> customers;
    vector<Vehicle> vehicles;
    vector<Service> services;
    // Load existing records
    loadCustomers(customers);
    loadVehicles(vehicles);
    loadServices(services);
    cout << "\n";
    cout << "============================================\n";
    cout << "     VEHICLE SERVICE MANAGEMENT SYSTEM\n";
    cout << "============================================\n";
    cout << "\nRecords loaded from files.\n";
    cout << "Customers loaded : " << customers.size() << endl;
    cout << "Vehicles loaded  : " << vehicles.size() << endl;
    cout << "Services loaded  : " << services.size() << endl;
    int choice;
    // Main Menu
   do{
        cout << "\n";
        cout << "============================================\n";
        cout << "                  MAIN MENU\n";
        cout << "============================================\n";
        cout << "1.  Register New Customer\n";
        cout << "2.  Register New Vehicle\n";
        cout << "3.  Record Vehicle Service\n";
        cout << "4.  Search Vehicle by Registration Number\n";
        cout << "5.  Search Customer by Customer ID\n";
        cout << "6.  Update Vehicle Service Details\n";
        cout << "7.  Delete a Service Record\n";
        cout << "8.  Display All Customers\n";
        cout << "9.  Display All Vehicles\n";
        cout << "10. Display Complete Service History of a Vehicle\n";
        cout << "11. Generate Vehicle Service Bill\n";
        cout << "12. Exit\n";
        cout << "============================================\n";
        cout << "Enter your choice: ";
        if (!(cin >> choice)){
            cout << "\nInvalid input. Please enter a number.\n";
            clearInput();
            continue;
        }
        switch (choice){
            case 1:
                registerCustomer(customers);
                break;
            case 2:
                registerVehicle(customers, vehicles);
                break;
            case 3:
                recordService(customers, vehicles, services);
                break;
            case 4:
                searchVehicleByRegistration(vehicles);
                break;
            case 5:
                searchCustomerByID(customers);
                break;
            case 6:
                updateService(services);
                break;
            case 7:
                deleteService(services);
                break;
            case 8:
                displayAllCustomers(customers);
                break;
            case 9:
                displayAllVehicles(vehicles);
                break;
            case 10:
                displayServiceHistory(vehicles, services);
                break;
            case 11:
                generateBill(customers, vehicles, services);
                break;
            case 12:
                cout << "\nSaving records...\n";
                saveCustomers(customers);
                saveVehicles(vehicles);
                saveServices(services);
                cout << "All records saved successfully.\n";
                cout << "Thank you for using the system!\n";
                break;
            default:
                cout << "\nInvalid choice. Please select "
                     << "an option from 1 to 12.\n";
        }
    } while (choice != 12);


    return 0;
}