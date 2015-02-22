# Philosophy

The goal is to compartmentalize data flowing through a system. Fortune is concerned with the sequence of that flow from the client through to the data adapter, and back to the client again, or simply from the adapter to the client. The serializers are flexible enough to allow any style of API to be implemented (REST, RPC, etc.), while the schemas and internal dispatcher allow for [Xanadu](http://www.xanadu.com/)-like links between entities, that is bi-directional relationships and transclusions.

The earliest concept of hypermedia was a [mechanical device that created trails of links between microfilms](https://en.wikipedia.org/wiki/Memex). It wasn't until 1965 that Ted Nelson [coined the term "hypermedia"](http://www.historyofinformation.com/expanded.php?id=1055) as a digital system of hyperlinks and media. Fast forward to today and we have the world wide web, and along with it, [HTTP](https://en.wikipedia.org/wiki/Hypertext_Transfer_Protocol), [REST](https://en.wikipedia.org/wiki/Representational_state_transfer), etc. [Hypertext](https://en.wikipedia.org/wiki/Hypertext) provides a fundamental layer of understanding which REST builds upon. RESTful services resemble web pages in that links are present in the media, which a client can discover and follow. This promotes decoupling of server and client, and discovery of new information.

> "REST is software design on the scale of decades: every detail is intended to promote software longevity and independent evolution. Many of the constraints are directly opposed to short-term efficiency." -- Roy T. Fielding

Building hypermedia APIs is hard. If it wasn't hard then everyone would be doing it already. Fortune aims to present simple options for building hypermedia APIs, with most of the hard work done already. Of course, it is also possible to build other types of APIs using Fortune, but it focuses on the most difficult use case first.