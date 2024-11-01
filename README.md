# @ngx-grida/builder

This builder helps convert xliff files to json.

## Getting Started

### Install the builder

In the Angular workspace root folder, run this command to install the builder:

```bash
npm install --save-dev @ngx-grida/builder
```

### Add the builder to your project

```
  "projects": {
    "my-project": {
        "xliff-to-json": {
          "builder": "@ngx-grida/builder:xliff-to-json",
          "options": {
            "locales": ["fr"],
            "source": "src/locales",
            "destination": "public/locales"
          }
        }
      }
  }
```

### Run it

To generare the json files run:

```bash
ng run my-project:xliff-to-json
```

## License

MIT © 2024-2024 Khalil LAGRIDA
