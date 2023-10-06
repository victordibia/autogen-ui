# AutoGen UI

Experimental UI for AutoGen agents, based on the [AutoGen](https://github.com/microsoft/autogen) library. The UI is built using Next.js and web apis built using FastApi.

> **Note:** This is an experimental project and this might change.

## Getting Started

Install dependencies. Python 3.8+ is required.

```bash
pip install -e .
```

Run ui server.

```bash
autogenui # or with --port 8081
```

Open http://localhost:8081 in your browser.

To modify the source files, make changes in the frontend source files and run `npm run build` to rebuild the frontend.

## Status

v0.0.1 goals

- [ ] **FastApi end point for AutoGen**.
      This involves setting up a FastApi endpoint that can respond to end user prompt based requests using a basic two agent format.
- [ ] **Basic Chat UI**
      Front end UI with a chatbox to enable sending requests and showing responses from the end point for a basic 2 agent format.
- [ ] **Flow based Playground UI**  
       Explore the use of a tool like React Flow to add agent nodes and compose agent flows. For example, setup an assistant agent + a code agent, click run and view output in a chat window.
