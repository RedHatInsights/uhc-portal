#!/bin/bash
set -e

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "MSW Development Setup"
echo "========================"
echo ""

# Check if mkcert is installed
if ! command -v mkcert &> /dev/null; then
    echo "Error: mkcert is not installed"
    echo ""
    echo "Please install mkcert first:"
    echo ""
    case "$(uname -s)" in
        Darwin)
            echo "  brew install mkcert"
            ;;
        Linux)
            echo "  Option 1 (package manager):"
            echo "    sudo dnf install mkcert    # Fedora/RHEL"
            echo "    sudo apt install mkcert    # Debian/Ubuntu"
            echo ""
            echo "  Option 2 (pre-built binary):"
            ARCH=$(uname -m)
            if [[ "$ARCH" == "x86_64" ]]; then
                echo "    curl -L https://github.com/FiloSottile/mkcert/releases/download/v1.4.4/mkcert-v1.4.4-linux-amd64 -o ~/.local/bin/mkcert"
            elif [[ "$ARCH" == "aarch64" ]]; then
                echo "    curl -L https://github.com/FiloSottile/mkcert/releases/download/v1.4.4/mkcert-v1.4.4-linux-arm64 -o ~/.local/bin/mkcert"
            fi
            echo "    chmod +x ~/.local/bin/mkcert"
            ;;
        *)
            echo "  See: https://github.com/FiloSottile/mkcert#installation"
            ;;
    esac
    echo ""
    exit 1
fi

echo "mkcert is installed"

# Check if CA is installed
CAROOT=$(mkcert -CAROOT)
if [[ ! -f "$CAROOT/rootCA.pem" ]]; then
    echo ""
    echo "Installing mkcert Certificate Authority..."
    mkcert -install
    echo "CA installed"
else
    echo "mkcert CA is already installed"
fi

# Check if certificates already exist
if [[ -f "$REPO_ROOT/prod.foo.redhat.com.pem" ]] && [[ -f "$REPO_ROOT/prod.foo.redhat.com-key.pem" ]]; then
    echo "Certificates already exist"
    echo ""
    echo "Setup complete! You can now run:"
    echo "   npm run msw"
    exit 0
fi

# Generate certificates
echo ""
echo "Generating certificates for prod.foo.redhat.com..."
cd "$REPO_ROOT"
mkcert -cert-file prod.foo.redhat.com.pem -key-file prod.foo.redhat.com-key.pem prod.foo.redhat.com

echo ""
echo "Setup complete!"
echo ""
echo "Next steps:"
echo "  1. Run: npm run msw"
echo "  2. Visit: https://prod.foo.redhat.com:1337/openshift"
echo ""
echo "Note: You may need to fully restart your browser the first time"
echo "   to pick up the trusted CA certificate."
echo ""
