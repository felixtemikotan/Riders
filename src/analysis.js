const { getTrips, getDriver } = require('api');

async function analysis() {
    let result = await getTrips();
    const resultCopy = result.map(x => x);

    let isCashBilledAmount = 0,
        nonCashBilledAmount = 0,
        noOfisCashTrips = 0,
        noOfNonCashTrips = 0;
    let uniqueDriverIDs = [];
    // Get total cash trip and all drivers IDs
    for (tripData of resultCopy) {
        if (!uniqueDriverIDs.includes(tripData.driverID)) {
            uniqueDriverIDs.push(tripData.driverID);
        }
        if (tripData.isCash) {
            isCashBilledAmount += parseFloat(String(tripData.billedAmount).replace(/,/g, ''));
            noOfisCashTrips += 1
        }

        // Get total non cash trip
        if (!tripData.isCash) {
            nonCashBilledAmount += parseFloat(String(tripData.billedAmount).replace(/,/g, ''))
            noOfNonCashTrips += 1
        }
    }
    //get all drivers unique IDs
    let driversInfo = [];
    let individualDriverTrips = [];
    //get all drivers details
    let individualTripsArr = [];
    let individualTripsObj = {};
    for (drivers of uniqueDriverIDs) {
        driversInfo.push(getDriver(drivers));
        //get each driver trips
        const driverIndividualTrips = resultCopy.filter(data => {
                if (data.driverID == drivers) {
                    return data
                }
            })
            //get individual driver total trips
        individualTripsObj.driverID = drivers;
        individualTripsObj.noOfTrips = driverIndividualTrips.length;
        individualTripsArr.push(individualTripsObj);
        individualTripsObj = {};

        //get each driver trips into an array
        individualDriverTrips.push(driverIndividualTrips);
    }

    //remove driver details whose details were not found
    const noOfDriversWithMoreThanOneVehicles = (await Promise.allSettled(driversInfo)).filter(data => {

        //get how many drivers have vehicles that are more than one
        if (data.status === "fulfilled" && (data.value).vehicleID.length > 1) {
            return data;
        }
    }).length;
    //sort drivers according to their earnings from highest to lowest
    const mostEarnedSort = individualDriverTrips.sort((a, b) => {
        return (b.reduce((acc, cur) => {
            return acc + parseFloat(String(cur.billedAmount).replace(/,/g, ''))
        }, 0) - a.reduce((acc, cur) => {
            return acc + parseFloat(String(cur.billedAmount).replace(/,/g, ''))
        }, 0))
    })
    let driverIndividualEarnings = {};
    let driverIndividualEarningsArr = [];
    //get individual driver trip earnings
    for (driver of mostEarnedSort) {

        const tripEarnings = driver.reduce((acc, cur) => {
            return acc + parseFloat(String(cur.billedAmount).replace(/,/g, ''))
        }, 0)

        driverIndividualEarnings.driverID = `${driver[0].driverID}`;
        driverIndividualEarnings.totalEarning = `${tripEarnings}`
        driverIndividualEarningsArr.push(driverIndividualEarnings)
        driverIndividualEarnings = {}
    }
    individualTripsArr.sort((a, b) => {
            return b.noOfTrips - a.noOfTrips
        })
        // get drivers IDs with highest trips
    const value = individualTripsArr[0].noOfTrips;
    const driverWithMostTrips = individualTripsArr.filter((element => {
        if (element.noOfTrips === value) {
            return element
        }
    }))
    const driverWithMostTripsID = driverWithMostTrips[0].driverID;
    const driverWithMostTripsNoOfTrips = driverWithMostTrips[0].noOfTrips;
    const driverWithMostTripsTotalEarning = driverIndividualEarningsArr.filter((element) => {
        if (element.driverID === driverWithMostTripsID) {
            return element
        }
    })
    const driverWithMostTripsInitDetails = await getDriver(driverWithMostTripsID);
    const driverWithMostTripsFinalDetails = {
        "name": driverWithMostTripsInitDetails.name,
        "email": driverWithMostTripsInitDetails.email,
        "phone": driverWithMostTripsInitDetails.phone,
        "noOfTrips": driverWithMostTripsNoOfTrips,
        "totalAmountEarned": Number(driverWithMostTripsTotalEarning[0].totalEarning)
    };

    //driver with highest earning
    const driverWithMostEarningsID = driverIndividualEarningsArr[0].driverID
    const driverWithMostEarningsTotalEarning = driverIndividualEarningsArr[0].totalEarning
    const hisInitDetails = await getDriver(driverWithMostEarningsID);
    const hisTotalTrips = individualTripsArr.filter((element) => {
        if (element.driverID === driverWithMostEarningsID) {
            return element
        }
    })
    const highestEarningDriverFinalDetails = {
        "name": hisInitDetails.name,
        "email": hisInitDetails.email,
        "phone": hisInitDetails.phone,
        "noOfTrips": hisTotalTrips[0].noOfTrips,
        "totalAmountEarned": Number(driverWithMostEarningsTotalEarning)
    };


    const finalOutput = {
        "noOfCashTrips": noOfisCashTrips,
        "noOfNonCashTrips": noOfNonCashTrips,
        "billedTotal": isCashBilledAmount + nonCashBilledAmount,
        "cashBilledTotal": isCashBilledAmount,
        "nonCashBilledTotal": Number(nonCashBilledAmount.toFixed(2)),
        "noOfDriversWithMoreThanOneVehicle": noOfDriversWithMoreThanOneVehicles,
        "mostTripsByDriver": driverWithMostTripsFinalDetails,
        "highestEarningDriver": highestEarningDriverFinalDetails
    }
    return finalOutput;

}
analysis()
module.exports = analysis