;; -*- mode: lisp; -*-

(:root ".")
(:directory "./../../slides/")
(:filename-style :directory)
(:htmlizer reveal::html)
(:title :auto)

(:preprocessors
 monkeylib-yamp::links
 monkeylib-yamp:images
 reveal::wrap-code
 reveal::fragments
 reveal::tdc
 reveal::h2-repl
 reveal::h3-repl)

;; Entries are (:slide-id . "2023-08-16")
(:dates
 (:welcome . "2023-08-16")
 (:back-to-school . "2023-09-21"))

;; Entries are (:slide-id . :category)
;; Slides not listed here get default category of :slides.
(:categories)
