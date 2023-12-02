import requests
import json

# ref: https://www.geeksforgeeks.org/read-json-file-using-python/
f = open("./data/data_with_towns.json")
file = json.load(f)

# add new column, 'Coordinates'
file["columns"].append("Coordinates")

# um1 = file["data"][1806][3]
# um2 = file["data"][1806][4]
# req = (
#     "https://api.mapserv.utah.gov/api/v1/geocode/"
#     + um1
#     + "/"
#     + um2
#     + "?apiKey=AGRC-Dev"
# )
# v = requests.get(req, params={"spatialReference": 4326})
# print("curr_add: " + str(um1))
# print("curr_zone: " + str(um2))
# print("index: " + str(1806))
# print(v)

# if v != None:
#     # grab the text returned and grab latitude and longitude

#     if v.status_code == 404:
#         print("CODE 404")
#     else:
#         api_return = json.loads(v.text)

# for all data points, add coordinates
for idx, i in enumerate(file["data"]):
    # get address and zone of current index
    curr_add = file["data"][idx][3]
    curr_zone = file["data"][idx][4]
    last_add = None
    last_zone = None
    # get address and zone of previous index
    if idx > 0:
        last_add = file["data"][idx - 1][3]
        last_zone = file["data"][idx - 1][4]

    if curr_add == last_add and curr_zone == last_zone:
        # print(str(file["data"][idx - 1]))
        # add the coordinates of last index to current index's data
        file["data"][idx].append(file["data"][idx - 1][12])
    else:
        # url to request from
        req = (
            "https://api.mapserv.utah.gov/api/v1/geocode/"
            + file["data"][idx][3]
            + "/"
            + file["data"][idx][4]
            + "?apiKey=AGRC-Dev"
        )

        # make the request and get the response
        v = requests.get(req, params={"spatialReference": 4326})
        # print("curr_add: " + str())
        # print("curr_zone: " + str())
        # print("index: " + str(idx))
        # print(v)
        # print("V STATUS CODE: " + str(v.status_code))
        if v is not None and v.status_code == 200:
            # grab the text returned and grab latitude and longitude
            api_return = json.loads(v.text)

            lat = api_return["result"]["location"]["y"]
            lon = api_return["result"]["location"]["x"]
        else:
            lat = 0
            lon = 0

        # add the coordinates to data
        file["data"][idx].append([lat, lon])

    if (idx % 1000) == 0:
        print(idx)
    # print(
    #     "Lat and Lon of " + file["data"][idx][2] + " is " + str(file["data"][idx][12])
    # )
    # print("\n")
    # print("---------------------------------")

# now save the data with newly added coordinates
# ref: https://www.w3schools.com/python/python_file_write.asp
new_f = open("data_with_towns_and_coords.json", "x")
new_f.write(json.dumps(file))
