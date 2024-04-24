;;
;; Copyright (c) 2022, Peter Seibel. All rights reserved.
;;

(defsystem bhs-cs-classes
  :name "bhs-cs-classes"
  :description "BHS CS Classes"
  :components
  ((:file "packages")
   (:file "reveal" :depends-on ("packages")))
  :depends-on
  (:cl-ppcre
   :monkeylib-utilities
   :monkeylib-yamp))
