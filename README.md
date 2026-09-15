# zoevo.io

The website of **zoevo**, a habit, focus and routine tracker for Android
([Google Play](https://play.google.com/store/apps/details?id=io.a51.zoevo)).

It is a static site served by GitHub Pages: no build step, no frameworks and
nothing loaded from other servers.

```
index.html          home page
manual.html         user manual: key concepts and how-tos
privacy.html        privacy policy (linked from the Play listing)
data_deletion.html  account and data deletion (linked from the Play listing)
404.html            not-found page
css/  js/           styles and the manual's small script
fonts/              Roboto (Apache License 2.0, see fonts/LICENSE-Roboto.txt)
img/                screenshots, app tiles, icons and the share image
```

Every page uses a strict Content-Security-Policy: no inline scripts or styles,
no third-party requests, no cookies.

To preview locally, run `python -m http.server 8080` in this folder and open
<http://localhost:8080/>.

Questions: [hi@zoevo.io](mailto:hi@zoevo.io). © [A51](https://a51.io)
