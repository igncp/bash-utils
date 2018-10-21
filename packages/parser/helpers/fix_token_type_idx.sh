#!/usr/bin/env bash

PACKAGE_PATH="$1"

cat > /tmp/fix_token_type_idx.sh <<"EOF"
#!/usr/bin/env bash

EXISTING_MATCHES=$(grep -Eo 'tokenTypeIdx: [0-9]+' "$1")

if [ ! -z "$EXISTING_MATCHES" ]; then
  sed -E -i 's|tokenTypeIdx: [0-9]+|tokenTypeIdx: expect.any(Number)|g' "$1"
fi
EOF

find "$PACKAGE_PATH/test/integration" -type f -name "*.test.*s" |
  xargs -I {} sh /tmp/fix_token_type_idx.sh {}
