import { StyleSheet, Dimensions } from 'react-native';
import theme from './theme';

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing * 2,
    justifyContent: 'center',
  },

  heading: {
    fontSize: theme.typography.heading,
    fontWeight: '700',
    color: theme.colors.primary,
    textAlign: 'center',
    marginBottom: theme.spacing * 2,
  },

  input: {
    borderWidth: 1,
    borderColor: theme.colors.secondary,
    paddingVertical: theme.spacing,
    paddingHorizontal: theme.spacing * 1.5,
    backgroundColor: theme.colors.cardBackground,
    fontSize: theme.typography.body,
    borderRadius: theme.borderRadius,
    marginBottom: theme.spacing * 2,
  },

  button: {
    width: width * 0.8,
    alignSelf: 'center',
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing * 1.2,
    borderRadius: theme.borderRadius,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
    marginTop: theme.spacing,
    marginBottom: theme.spacing * 2,
  },

  buttonText: {
    color: theme.colors.cardBackground,
    fontSize: theme.typography.subheading,
    fontWeight: '600',
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  modalBox: {
    width: '85%',
    backgroundColor: theme.colors.cardBackground,
    padding: theme.spacing * 2,
    borderRadius: theme.borderRadius,
    alignItems: 'center',
    elevation: 5,
  },

  modalText: {
    fontSize: theme.typography.body,
    color: theme.colors.textPrimary,
    textAlign: 'center',
    marginBottom: theme.spacing * 1.5,
  },

  closeButton: {
    backgroundColor: theme.colors.secondary,
    paddingVertical: theme.spacing * 0.8,
    paddingHorizontal: theme.spacing * 2,
    borderRadius: theme.borderRadius / 1.5,
  },

  closeButtonText: {
    color: theme.colors.cardBackground,
    fontSize: theme.typography.small,
    fontWeight: '600',
  },

  subheading: {
    fontSize: 16,
    marginVertical: 10,
    textAlign: 'center',
    color: '#555',
  },

  primaryButton: {
    backgroundColor: '#007bff',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
    marginVertical: 10,
    width: '80%',
    alignItems: 'center',
  },

  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },

  
});

export default styles;
