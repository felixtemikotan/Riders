const { getTrips, getVehicle, getDriver } = require('api');

async function driverReport() {

    let tripsData = await getTrips();

    let driverId = [],
        cashTrips = {},
        nonCashTrips = {},
        totalEarnings = {},
        cashAmount = {},
        nonCashAmount = {};

    for (let driverTrip of tripsData) {
        if (!driverId.includes(driverTrip.driverID)) {
            driverId.push(driverTrip.driverID);
        }

        if (driverTrip['isCash']) {
            if (cashTrips[driverTrip.driverID]) {
                cashTrips[driverTrip.driverID]++;
            } else {
                cashTrips[driverTrip.driverID] = 1;
            }
        }
        if (!driverTrip['isCash']) {
            if (nonCashTrips[driverTrip.driverID]) {
                nonCashTrips[driverTrip.driverID]++;
            } else {
                nonCashTrips[driverTrip.driverID] = 1;
            }
        }
        if (totalEarnings[driverTrip.driverID]) {
            totalEarnings[driverTrip.driverID] += parseFloat(String(driverTrip.billedAmount).replace(/,/g, ''));
        } else {
            totalEarnings[driverTrip.driverID] = parseFloat(String(driverTrip.billedAmount).replace(/,/g, ''));
        }
        if (driverTrip.isCash) {
            if (cashAmount[driverTrip.driverID]) {
                cashAmount[driverTrip.driverID] += parseFloat(String(driverTrip['billedAmount']).replace(/,/g, ''));
            } else {
                cashAmount[driverTrip.driverID] = parseFloat(String(driverTrip['billedAmount']).replace(/,/g, ''));
            }
        }
        if (!driverTrip.isCash) {
            if (nonCashAmount[driverTrip.driverID]) {
                nonCashAmount[driverTrip.driverID] += parseFloat(String(driverTrip['billedAmount']).replace(/,/g, ''));
            } else {
                nonCashAmount[driverTrip.driverID] = parseFloat(String(driverTrip['billedAmount']).replace(/,/g, ''));
            }
        }
    }

    let cashTripsInfo = Object.values(cashTrips);
    let nonCashTripsInfo = Object.values(nonCashTrips);
    let totalEarningsInfo = Object.values(totalEarnings);
    let totalCash = Object.values(cashAmount);
    let totalNonCash = Object.values(nonCashAmount);

    let allDriverDetails = []
    for (let ID of driverId) {
        allDriverDetails.push(getDriver(ID));
    }
    let promiseDriverInfo = await Promise.allSettled(allDriverDetails);

    let driverRecord = [];

    for (let eachData of promiseDriverInfo) {
        if (eachData['status'] === 'fulfilled') {
            driverRecord.push(eachData);
        }
    }


    const driverTrips = {};
    for (let element of tripsData) {
        if (driverTrips[element.driverID]) {
            driverTrips[element.driverID]++;
        } else {
            driverTrips[element.driverID] = 1;
        }
    }

    let numOfTrips = Object.values(driverTrips);


    let vehicle = [];
    let vehicleInformation = [];
    for (let element of driverRecord) {
        if (!vehicle.includes(element.value['vehicleID'])) {
            vehicle.push(element.value.vehicleID)
        }
    }
    for (let elem of vehicle) {
        if (!vehicle.includes['vehicleID']) {
            vehicleInformation.push(getVehicle(elem))
        }
    }
    let promiseVehicleInfo = await Promise.allSettled(vehicleInformation)


    let correctVehicleInfo = [];
    for (let elem of promiseVehicleInfo) {
        if (elem['status'] === 'fulfilled') {
            correctVehicleInfo.push(elem);
        }
    }

    let vehiclesPlate;
    let vehicleDetails = [];
    for (let elem in correctVehicleInfo) {
        vehiclesPlate = {}
        vehiclesPlate['plate'] = correctVehicleInfo[elem].value.plate;
        vehiclesPlate['manufacturer'] = correctVehicleInfo[elem].value.manufacturer;
        vehicleDetails.push(vehiclesPlate);
    }


    let userDetails = [];
    for (let elem in tripsData) {
        let userInfo = {
            'user': tripsData[elem].user.name,
            'created': tripsData[elem].created,
            'pickup': tripsData[elem].pickup,
            'destination': tripsData[elem].destination,
            'billed': tripsData[elem].billedAmount,
            'isCash': tripsData[elem].isCash,
        }
        userDetails.push(userInfo)
    }


    let finalOutput = [];

    for (let elem in driverRecord) {
        let output = {};
        if (driverRecord[elem]) {
            let driverVehicle = [];
            driverVehicle.push(vehicleDetails[elem])
            output = {

                "fullName": driverRecord[elem].value.name,
                "id": driverId[elem],
                "phone": driverRecord[elem].value.phone,
                "noOfTrips": numOfTrips[elem],
                "noOfVehicles": (driverRecord[elem].value.vehicleID).length,
                "vehicles": driverVehicle,
                "noOfCashTrips": cashTripsInfo[elem],
                "noOfNonCashTrips": nonCashTripsInfo[elem],
                "totalAmountEarned": Number((totalEarningsInfo[elem]).toFixed(2)),
                "totalCashAmount": totalCash[elem],
                "totalNonCashAmount": Number((totalNonCash[elem].toFixed(2))),
                "trips": userDetails[elem],
            }
        }
        finalOutput.push(output);

    }
    return finalOutput;
}

module.exports = driverReport;