rm -rf ../CoffeeAddiction/src/generated-client
npx openapi-generator-cli generate -i ./swagger.json -g typescript-fetch -o ../CoffeeAddiction/src/generated-client
