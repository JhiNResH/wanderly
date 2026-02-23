import UIKit
import Social
import MobileCoreServices
import UniformTypeIdentifiers

/// Wanderly Share Extension
/// Receives shared URLs from other iOS apps (Instagram, YouTube, TikTok, 小紅書, etc.)
/// Saves them to the App Group shared container so the main app can pick them up.
class ShareViewController: UIViewController {

    // MARK: - Constants
    private let appGroupID = "group.com.wanderly.app"
    private let sharedUrlKey = "wanderly_shared_url"

    // MARK: - UI
    private lazy var containerView: UIView = {
        let v = UIView()
        v.backgroundColor = UIColor.systemBackground
        v.layer.cornerRadius = 20
        v.layer.maskedCorners = [.layerMinXMinYCorner, .layerMaxXMinYCorner]
        v.translatesAutoresizingMaskIntoConstraints = false
        return v
    }()

    private lazy var handleBar: UIView = {
        let v = UIView()
        v.backgroundColor = UIColor.separator
        v.layer.cornerRadius = 2.5
        v.translatesAutoresizingMaskIntoConstraints = false
        return v
    }()

    private lazy var iconLabel: UILabel = {
        let l = UILabel()
        l.text = "✨"
        l.font = UIFont.systemFont(ofSize: 40)
        l.textAlignment = .center
        l.translatesAutoresizingMaskIntoConstraints = false
        return l
    }()

    private lazy var titleLabel: UILabel = {
        let l = UILabel()
        l.text = "Saving to Wanderly..."
        l.font = UIFont.systemFont(ofSize: 18, weight: .bold)
        l.textAlignment = .center
        l.textColor = UILabel().textColor
        l.translatesAutoresizingMaskIntoConstraints = false
        return l
    }()

    private lazy var subtitleLabel: UILabel = {
        let l = UILabel()
        l.text = "AI will summarize & organize this for you"
        l.font = UIFont.systemFont(ofSize: 14)
        l.textAlignment = .center
        l.textColor = UIColor.secondaryLabel
        l.translatesAutoresizingMaskIntoConstraints = false
        return l
    }()

    private lazy var activityIndicator: UIActivityIndicatorView = {
        let a = UIActivityIndicatorView(style: .medium)
        a.translatesAutoresizingMaskIntoConstraints = false
        return a
    }()

    // MARK: - Lifecycle

    override func viewDidLoad() {
        super.viewDidLoad()
        setupUI()
        extractAndSaveURL()
    }

    // MARK: - Setup

    private func setupUI() {
        view.backgroundColor = UIColor.black.withAlphaComponent(0.4)

        view.addSubview(containerView)
        containerView.addSubview(handleBar)
        containerView.addSubview(iconLabel)
        containerView.addSubview(titleLabel)
        containerView.addSubview(subtitleLabel)
        containerView.addSubview(activityIndicator)

        NSLayoutConstraint.activate([
            containerView.leadingAnchor.constraint(equalTo: view.leadingAnchor),
            containerView.trailingAnchor.constraint(equalTo: view.trailingAnchor),
            containerView.bottomAnchor.constraint(equalTo: view.bottomAnchor),
            containerView.heightAnchor.constraint(equalToConstant: 220),

            handleBar.topAnchor.constraint(equalTo: containerView.topAnchor, constant: 10),
            handleBar.centerXAnchor.constraint(equalTo: containerView.centerXAnchor),
            handleBar.widthAnchor.constraint(equalToConstant: 40),
            handleBar.heightAnchor.constraint(equalToConstant: 5),

            iconLabel.topAnchor.constraint(equalTo: handleBar.bottomAnchor, constant: 20),
            iconLabel.centerXAnchor.constraint(equalTo: containerView.centerXAnchor),

            titleLabel.topAnchor.constraint(equalTo: iconLabel.bottomAnchor, constant: 12),
            titleLabel.leadingAnchor.constraint(equalTo: containerView.leadingAnchor, constant: 20),
            titleLabel.trailingAnchor.constraint(equalTo: containerView.trailingAnchor, constant: -20),

            subtitleLabel.topAnchor.constraint(equalTo: titleLabel.bottomAnchor, constant: 6),
            subtitleLabel.leadingAnchor.constraint(equalTo: containerView.leadingAnchor, constant: 20),
            subtitleLabel.trailingAnchor.constraint(equalTo: containerView.trailingAnchor, constant: -20),

            activityIndicator.topAnchor.constraint(equalTo: subtitleLabel.bottomAnchor, constant: 20),
            activityIndicator.centerXAnchor.constraint(equalTo: containerView.centerXAnchor),
        ])

        activityIndicator.startAnimating()
    }

    // MARK: - URL Extraction

    private func extractAndSaveURL() {
        guard let extensionItems = extensionContext?.inputItems as? [NSExtensionItem] else {
            showError("No content received")
            return
        }

        for extensionItem in extensionItems {
            guard let attachments = extensionItem.attachments else { continue }

            for attachment in attachments {
                // Try URL type first
                if attachment.hasItemConformingToTypeIdentifier(UTType.url.identifier) {
                    attachment.loadItem(forTypeIdentifier: UTType.url.identifier, options: nil) { [weak self] item, error in
                        DispatchQueue.main.async {
                            if let url = item as? URL {
                                self?.saveURL(url.absoluteString)
                            } else if let urlStr = item as? String, let url = URL(string: urlStr) {
                                self?.saveURL(url.absoluteString)
                            } else {
                                self?.showError("Could not read URL")
                            }
                        }
                    }
                    return
                }

                // Fallback: plain text (e.g. user copied URL and shared as text)
                if attachment.hasItemConformingToTypeIdentifier(UTType.plainText.identifier) {
                    attachment.loadItem(forTypeIdentifier: UTType.plainText.identifier, options: nil) { [weak self] item, error in
                        DispatchQueue.main.async {
                            if let text = item as? String,
                               let url = URL(string: text),
                               url.scheme?.hasPrefix("http") == true {
                                self?.saveURL(url.absoluteString)
                            } else {
                                self?.showError("No valid URL found")
                            }
                        }
                    }
                    return
                }
            }
        }

        showError("Unsupported content type")
    }

    private func saveURL(_ urlString: String) {
        // Save to App Group shared UserDefaults so main app can read it
        if let defaults = UserDefaults(suiteName: appGroupID) {
            defaults.set(urlString, forKey: sharedUrlKey)
            defaults.synchronize()
        }

        // Also save to AsyncStorage key (mirrored format for React Native)
        // React Native AsyncStorage uses a specific format
        saveToAsyncStorage(urlString)

        showSuccess(urlString)
    }

    /// Mirror the URL into AsyncStorage format so React Native can read it
    private func saveToAsyncStorage(_ urlString: String) {
        let defaults = UserDefaults(suiteName: appGroupID)
        // AsyncStorage stores as JSON string
        let jsonValue = "\"\(urlString.replacingOccurrences(of: "\"", with: "\\\""))\""
        defaults?.set(jsonValue, forKey: "@AsyncStorage:\(sharedUrlKey)")
        defaults?.synchronize()
    }

    private func showSuccess(_ url: String) {
        activityIndicator.stopAnimating()
        titleLabel.text = "Saved to Wanderly ✓"
        iconLabel.text = "✅"

        // Detect platform for friendly message
        let platformName = detectPlatform(url)
        subtitleLabel.text = "Your \(platformName) link is queued for AI processing"

        DispatchQueue.main.asyncAfter(deadline: .now() + 1.5) { [weak self] in
            self?.extensionContext?.completeRequest(returningItems: [], completionHandler: nil)
        }
    }

    private func showError(_ message: String) {
        activityIndicator.stopAnimating()
        titleLabel.text = "Couldn't save link"
        iconLabel.text = "⚠️"
        subtitleLabel.text = message

        DispatchQueue.main.asyncAfter(deadline: .now() + 2.0) { [weak self] in
            self?.extensionContext?.cancelRequest(withError: NSError(
                domain: "com.wanderly.ShareExtension",
                code: -1,
                userInfo: [NSLocalizedDescriptionKey: message]
            ))
        }
    }

    private func detectPlatform(_ url: String) -> String {
        if url.contains("youtube.com") || url.contains("youtu.be") { return "YouTube" }
        if url.contains("instagram.com") { return "Instagram" }
        if url.contains("tiktok.com") || url.contains("douyin.com") { return "TikTok / 抖音" }
        if url.contains("xiaohongshu.com") || url.contains("xhslink.com") { return "小紅書" }
        if url.contains("twitter.com") || url.contains("x.com") { return "Twitter / X" }
        return "web"
    }
}
