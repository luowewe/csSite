(in-package :reveal)

(defun html (doc config)
  (let* ((styles (config :styles config))
        ;;(scripts (config :scripts config)
         (title (just-text (first (extract :h1 doc))))
         (slug (slugify title))
         (date (cdr (assoc slug (rest (assoc :dates config)))))
         (category (or (cdr (assoc slug (rest (assoc :categories config)))) :slides)))

    `(:progn
       (:noescape ,(metadata title date category))
       (:noescape "<!doctype html>")
       ((:html :lang "en")
        (:head
         (:meta :http-equiv "content-type" :content "text/html; charset=UTF-8")
         (:meta :name "viewport" :content "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no")
         (:link :rel "stylesheet" :href "/reveal/dist/reset.css")
         (:link :rel "stylesheet" :href "/reveal/dist/reveal.css")
         (:link :rel "stylesheet" :href "/reveal/dist/theme/black.css")
         (:link :rel "stylesheet" :href "/reveal/dist/custom.css")
         (:link :rel "stylesheet" :href "/reveal/plugin/highlight/monokai.css")
         (:link :rel "stylesheet" :href "/css/bootstrap-icons.css")
         (:link :rel "stylesheet" :href "/css/logo.css")
         ,@(loop for s in styles collecting s))
        (:body
         ((:div :class "reveal")
          ((:div :class "footer logo")
           ((:a :href "/") (:i :class "bi bi-house-fill")))
          ((:div :class "slides")
           ,@(split-to-slides (rest doc))))
         (:script :src "/reveal/dist/reveal.js")
         (:script :src "/reveal/plugin/notes/notes.js")
         (:script :src "/reveal/plugin/markdown/markdown.js")
         (:script :src "/reveal/plugin/highlight/highlight.js")
         (:script
          (:noescape
           "// More info about initialization & config:
            // - https://revealjs.com/initialization/
            // - https://revealjs.com/config/
            Reveal.initialize({
              hash: true,
              // Learn about plugins: https://revealjs.com/plugins/
              plugins: [ RevealMarkdown, RevealHighlight, RevealNotes ]
            });")))))))

(defun multiple-choice (doc config)
  (destructuring-bind (body h1 instructions &rest questions) doc
    (declare (ignore body))
    (let* ((title (just-text h1))
           (slug (slugify title))
           (date (cdr (assoc slug (rest (assoc :dates config))))))
      `(:progn
         (:noescape ,(form-assessment-metadata title date))
         (:noescape ,(with-output-to-string (s)
                       (format s "~2&{% extends 'form-assessment.njk' %}")
                       (format s "~2&{% block instructions %}~%")))
         ,@(rest instructions)
         (:noescape ,(format nil "~2&{% endblock %}"))
         (:noescape ,(format nil "~3&{% block questions %}~%"))
         ,@(split-to-questions questions)
         (:noescape ,(format nil "~&{% endblock %}"))))))

(defun slugify (title)
  (keywordize (remove-if-not (lambda (c) (or (alphanumericp c) (eql c #\-))) (substitute #\- #\Space title))))

(defun metadata (title date category)
  (with-output-to-string (s)
    (format s "~&---")
    (format s "~&tags: ~(~a~)" category)
    (format s "~&title: ~a" title)
    (format s "~&date: ~a" date)
    (format s "~&---~2%")))

(defun form-assessment-metadata (title date)
  (declare (ignore date))
  (with-output-to-string (s)
    (format s "~&---")
    (format s "~&title: ~a" title)
    (format s "~&---~%")))

(defun OLDform-assessment-metadata (title date)
  (declare (ignore date))
  (with-output-to-string (s)
    (format s "~&---")
    ;;(format s "~&layout: form-assessment.liquid")
    (format s "~&title: ~a" title)
    ;;(format s "~&date: ~a" date)
    (format s "~&---~%")
    (format s "~2&{% extends 'form-assessment.njk' %}")
    (format s "~2&{% block instructions %}")
    (format s "~2&{{ super() }}")
    (format s "~&Something goes here.")
    (format s "~&{% endblock %}")))



(defun split-to-slides (doc)
  (let ((sections ())
        (current ()))
    (dolist (e doc)
      (when (and current (member (first e) '(:h1 :h2 :h3)))
        (push (cons :section (nreverse current)) sections)
        (setf current ()))
      (when (and (second e) (not (or (equal (second e) "_none") (equal (second e) "."))))
        (push e current)))
    (when current
      (push (cons :section (nreverse current)) sections))
    (nreverse sections)))

(defun split-to-questions (doc)
  (let ((divs ())
        (current ()))
    (dolist (e doc)
      (cond
        ((eql (first e) :h2)
         (when current
           (push (cons :div (nreverse current)) divs))
         (setf current ()))
        (t
         (push e current))))
    (when current
      (push (cons :div (nreverse current)) divs))
    (nreverse divs)))

(defun wrap-code (doc config)
  (declare (ignore config))
  (funcall (rewriter :pre #'code-wrapper) doc))

(defun fragments (doc config)
  (declare (ignore config))
  (funcall (>>>
            (rewriter :fragment #'(lambda (e) `(:span :class "fragment" ,@(rest e))))
            (rewriter :fragments #'fragmentize))
           doc))

(defun tdc (doc config)
  (declare (ignore config))
  (funcall (rewriter :tdc #'(lambda (e) `(:td :align "center" ,@(rest e)))) doc))

(defun h2-repl (doc config)
  (declare (ignore config))
  (flet ((fn (e)
           (let* ((text (second e))
                  (pos (and (stringp text) (search "⟹" text))))
             (if pos
               `(:h2
                 (:div :class "repl"
                       (:div (:span :class "prompt" "» ") (:span :class "fragment" ,(subseq text 0 pos)))
                       (:div :class "fragment" ,(subseq text (1+ pos)))))
               e))))
    (funcall (rewriter :h2 #'fn) doc)))

(defun h3-repl (doc config)
  (declare (ignore config))
  (flet ((fn (e)
           (let* ((text (second e))
                  (pos (and (stringp text) (search "⟹" text))))
             (if pos
               `(:h3
                 (:div :class "repl"
                       (:div (:span :class "prompt" "» ") (:span :class "fragment" ,(subseq text 0 pos)))
                       (:div :class "fragment" ,(subseq text (1+ pos)))))
               e))))
    (funcall (rewriter :h3 #'fn) doc)))


(defun fragmentize (e)
  "Turn the child elements into fragments. However treats lists (:ul and :ol)
specially, turning the list elements into the fragments. This does mean there's
no good way to make a whole list into a fragment."
  (flet ((make-fragment (x)
           `(,(car x) :class "fragment" ,@(rest x))))
    (let ((body (rest e)))
      (cond
        ((list-fragments-p body)
         `(,(caar body) ,@(funcall (rewriter :li #'make-fragment) (cdar body))))
        (t
         `(:progn
            ,@(mapcar #'make-fragment body)))))))



(defun list-fragments-p (body)
  (and (null (cdr body)) (member (caar body) '(:ul :ol))))

(defun code-wrapper (e)
  (let* ((text (just-text e))
         (language (guess-language text)))
    (multiple-value-bind (code highlights) (extract-code-highlights text)
      `(:pre
        ((:code
          ,@(when highlights `(:data-line-numbers ,highlights))
          :data-trim ""
          :data-noescape ""
          :class ,language)
         ,code)))))

(defun guess-language (text)
  ;; In theory highlight.js is supposed to be able to guess languages but it
  ;; doesn't seem to do a very good job.
  (cond
    ((scan "<(\\w+).*?>.*</\\1>" text) "language-html")
    ((scan "HTTP/1\.1" text) "language-http")
    ((scan "curl " text) "language-bash")
    (t "language-javascript")))

(defun hl-numbers (line)
  (values
   (register-groups-bind (hl) ("\\s+{{hl:([0-9,]+)}}" line)
     (mapcar #'parse-integer (split "," hl)))))


(defun extract-code-highlights (text)
  (let* ((hl-pat (create-scanner "\\s+{{hl:([0-9,]+)}}" :multi-line-mode t))
         (clean (regex-replace-all hl-pat text ""))
         (lines (split "\\n" text)))
    (let ((i 1)
          (highlights (make-hash-table)))
      (mapc
       #'(lambda (line)
           (let ((ns (hl-numbers line)))
             (when ns
               (dolist (n ns)
                 (push i (gethash n highlights ())))))
           (incf i))
       lines)
      (values clean (highlights-string highlights)))))

(defun highlights-string (h)
  (when (plusp (hash-table-count h))
    (let ((alist ()))
      (maphash #'(lambda (k v) (push (cons k v) alist)) h)
      (format nil "|~{~{~a~^,~}~^|~}" (mapcar #'(lambda (x) (sort (cdr x) #'<)) (sort alist #'< :key #'car))))))
