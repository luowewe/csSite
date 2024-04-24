#!/bin/bash

git mv index.html index.njk
cat <<EOF > testcases.js
const testcases = (() => {
  return {
    referenceImpls: {
    },

    allCases: {
    }
  }

})();

EOF

cat frame/testcases.js >> testcases.js

git restore --staged frame
rm -rf frame/


cat <<EOF >> index.njk

{% block testcases %}

{% endblock %}
EOF
