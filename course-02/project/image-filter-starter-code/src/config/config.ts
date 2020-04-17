export const config = {
    "app": {
      "port": process.env.PORT || 8082,
      "defaultMessage": "try GET /api/v0/filteredimage?image_url={{}}"
    },
    "image": {
      "subDir": "/tmp/",
      "imageName": "filtered.",
      "extension": ".jpg"
    }
  }