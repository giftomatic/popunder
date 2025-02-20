# Giftomatic Popunder

A lightweight JavaScript module that opens two links simultaneously: one in a new tab and another as a 'popunder' in the original tab after a configurable delay. If the user returns to the original tab before redirection, the event is canceled.

## Installation

```bash
npm i @giftomatic/popunder
```

## Usage

```javascript
import * as Popunder from "@giftomatic/popunder";
Popunder.install();
```

## Example

```html
<!-- Simple link -->
<a
  href="https://www.google.com"
  target="_blank"
  data-popunder="https://www.bing.com"
>
  Google
</a>

<!-- Link with delay configured -->
<a
  href="https://www.amazon.co.uk"
  target="_blank"
  data-popunder="https://www.amazon.com"
  data-refresh-delay="5"
>
  Amazon
</a>
```

Or see the [full example](./popunder.html).

## Install through jsDelivr

```js
import * as Popunder from "https://cdn.jsdelivr.net/npm/@giftomatic/popunder@1.0.0/dist/esm/popunder.js";
```

## Configuration

| Option               | Type   | Required | Description                                                 |
| -------------------- | ------ | -------- | ----------------------------------------------------------- |
| `data-popunder`      | URL    | Yes      | URL to open as a popunder                                   |
| `data-refresh-delay` | Number | No       | Delay in seconds before opening the popunder, default is 3s |
