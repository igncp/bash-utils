PACKAGE_PATH="$1"

find "$PACKAGE_PATH/integration_tests" -type f -name "*.test.*s" |
  xargs -I {} sed -i 's|tokenTypeIdx: [0-9]+|tokenTypeIdx: expect.any(Number)|g' {}
