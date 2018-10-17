#!/usr/bin/env bash

set -e

create_and_add_common_ignores() {
  FILE_PATH="$1"

  echo "# autogenerated, please check helpers/generate_ignore_files.sh" > "$FILE_PATH"

  echo "" >> "$FILE_PATH"
  echo "node_modules" >> "$FILE_PATH"
  echo "coverage" >> "$FILE_PATH"
  echo "flow-coverage" >> "$FILE_PATH"
  echo "lib" >> "$FILE_PATH"
  echo "dist" >> "$FILE_PATH"
  echo "build" >> "$FILE_PATH"
}

create_and_add_common_ignores .gitignore
create_and_add_common_ignores .eslintignore
create_and_add_common_ignores .stylelintignore

cat >> .gitignore <<"EOF"
*.log
*.tgz
EOF

cat >> .eslintignore <<"EOF"
!.eslintrc.js
!.stylelintrc.js
!.babelrc.js
packages/eslint-plugin-bashutils/tests/integration
EOF
