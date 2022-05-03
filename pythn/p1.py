from pymongo_db_connection import get_database
dbname = get_database()

collection_name = dbname["pipeline-dataset-datas"]

from bson.objectid import ObjectId

# datasets = ["62205527d81d16026c66a391","622050c95d7a3425a0925df8"]
datasets = [ObjectId("62205527d81d16026c66a391"), ObjectId("622050c95d7a3425a0925df8")]

dataset_details = collection_name.find({ 'pipelineDataset': { '$in': datasets } })

for item in dataset_details:
    print(item)