// Latency checker for AWS
// justin.emilio@nutanix.com
export default function pingRegion(selectedRegion) {
  return new Promise((resolve, reject) => {
    //Step 1 - Get region info
    var regionInfo = getRegionInfo(selectedRegion); //Contains endpoint, id, and name of region

    //Step 2 - Create document element #imageCell to put the fake images into (Create Obj)
    var randomString = Math.floor(Math.random() * 0xffffffffffffffff).toString(
      36
    );

    var addedElement = document.createElement("div");
    addedElement.id = randomString;

    var body = document.body;
    body.insertBefore(addedElement, body.firstChild);

    document.getElementById(randomString).innerHTML +=
      "<img id='imageCell-" + randomString + "' ></img>";
    var imageCell = document.getElementById(`imageCell-${randomString}`);

    //Step 3 - Create random/fake link
    var targetUrl = regionInfo.endpoint + "ping?x=" + randomString;

    //Step 4 - Create first fake image
    while (imageCell.firstChild) imageCell.removeChild(imageCell.firstChild);
    imageCell.innerHTML =
      "<img id='pingImageOne-" + randomString + "' style='display: none'>";

    var pingImageOne = document.getElementById(`pingImageOne-${randomString}`);

    //Step 5 - Set the error function to resume (Step 6 is below the function)
    pingImageOne.addEventListener("error", function () {
      //Step 7 - Set the start time
      var startTime = new Date().getTime();

      //Step 8 - Create pingImage2 in #imageCell
      imageCell.innerHTML =
        "<img id='pingImageTwo-" + randomString + "' style='display: none'>";

      var pingImageTwo = document.getElementById(
        `pingImageTwo-${randomString}`
      );

      //Step 9 - Set the second error function to resume the process (Step 10 is below this function)
      pingImageTwo.addEventListener("error", function () {
        //Step 11 - Set endTime and calculate the round trip
        var endTime = new Date().getTime();
        var elapsed = endTime - startTime;
        resolve({ region: selectedRegion, latency: elapsed });
      });

      //Step 10 - Set the pingImageTwo source to the fake URL so it will error out
      pingImageTwo.setAttribute("src", targetUrl);
    });

    //Step 6 - Set the pingImageOne source to the fake URL so it will error out
    pingImageOne.setAttribute("src", targetUrl);
  });
}

//Function to get the information about a selected region
function getRegionInfo(region) {
  console.log(`Getting info for ${region}`);
  var awsRegions = [
    {
      name: "California",
      id: "us-west-1",
      endpoint: "https://dynamodb.us-west-1.amazonaws.com/",
    },
    {
      name: "Oregon",
      id: "us-west-2",
      endpoint: "https://dynamodb.us-west-2.amazonaws.com/",
    },
    {
      name: "Virginia",
      id: "us-east-1",
      endpoint: "https://dynamodb.us-east-1.amazonaws.com/",
    },
    {
      name: "Ohio",
      id: "us-east-2",
      endpoint: "https://dynamodb.us-east-2.amazonaws.com/",
    },
    {
      name: "Canada Central",
      id: "ca-central-1",
      endpoint: "https://dynamodb.ca-central-1.amazonaws.com/",
    },
    {
      name: "Ireland",
      id: "eu-west-1",
      endpoint: "https://dynamodb.eu-west-1.amazonaws.com/",
    },
    {
      name: "London",
      id: "eu-west-2",
      endpoint: "https://dynamodb.eu-west-2.amazonaws.com/",
    },
    {
      name: "Paris",
      id: "eu-west-3",
      endpoint: "https://dynamodb.eu-west-3.amazonaws.com/",
    },
    {
      name: "Frankfurt",
      id: "eu-central-1",
      endpoint: "https://dynamodb.eu-central-1.amazonaws.com/",
    },
    {
      name: "Stockholm",
      id: "eu-north-1",
      endpoint: "https://dynamodb.eu-north-1.amazonaws.com/",
    },
    {
      name: "Middle East - Bahrain",
      id: "me-south-1",
      endpoint: "https://dynamodb.me-south-1.amazonaws.com/",
    },
    {
      name: "Hong Kong",
      id: "ap-east-1",
      endpoint: "https://dynamodb.ap-east-1.amazonaws.com/",
    },
    {
      name: "Mumbai",
      id: "ap-south-1",
      endpoint: "https://dynamodb.ap-south-1.amazonaws.com/",
    },
    {
      name: "Tokyo",
      id: "ap-northeast-1",
      endpoint: "https://dynamodb.ap-northeast-1.amazonaws.com/",
    },
    {
      name: "Seoul",
      id: "ap-northeast-2",
      endpoint: "https://dynamodb.ap-northeast-2.amazonaws.com/",
    },
    {
      name: "Osaka-Local",
      id: "ap-northeast-3",
      endpoint: "https://dynamodb.ap-northeast-3.amazonaws.com/",
    },
    {
      name: "Singapore",
      id: "ap-southeast-1",
      endpoint: "https://dynamodb.ap-southeast-1.amazonaws.com/",
    },
    {
      name: "Sydney",
      id: "ap-southeast-2",
      endpoint: "https://dynamodb.ap-southeast-2.amazonaws.com/",
    },
    {
      name: "Sao Paulo",
      id: "sa-east-1",
      endpoint: "https://dynamodb.sa-east-1.amazonaws.com/",
    },
    {
      name: "Beijing",
      id: "cn-north-1",
      endpoint: "https://dynamodb.cn-north-1.amazonaws.com.cn/",
    },
    {
      name: "Ningxia",
      id: "cn-northwest-1",
      endpoint: "https://dynamodb.cn-northwest-1.amazonaws.com.cn/",
    },
    {
      name: "AWS Gov Cloud East",
      id: "us-gov-east-1",
      endpoint: "https://dynamodb.us-gov-east-1.amazonaws.com/",
    },
    {
      name: "AWS Gov Cloud West",
      id: "us-gov-west-1",
      endpoint: "https://dynamodb.us-gov-west-1.amazonaws.com/",
    },
  ];

  for (let i = 0; i < awsRegions.length; i++) {
    if (awsRegions[i].id == region) {
      return awsRegions[i]; //Return the region info
    }
  }
}
